import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

// Run against PR #15's stack; these tests exercise the actual import and export controls.
for (const keySignature of [null, 42, { unexpected: true }]) {
  test(`import, reload and export a non-text key (${JSON.stringify(keySignature)})`, async ({ page, context }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await page.locator('input[type=file]').setInputFiles({
      name: 'recovery.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        formatVersion: 'creative-project-package-v1', projectType: 'music-video',
        title: 'Recovery cut', slug: 'recovery-cut',
        inputs: { bpm: 100, keySignature, runtimeSeconds: 12 },
        scenes: [
          { id: 'gap', title: 'Upper deck', durationSeconds: 8,
            shots: [{ id: 'short', label: 'Rider', durationSeconds: 3, subject: 'Rider', prompt: 'Night bus.' }] },
          { id: 'full', title: 'Depot', durationSeconds: 4,
            shots: [{ id: 'complete', label: 'Arrival', durationSeconds: 4, subject: 'Bus', prompt: 'Depot.' }] },
        ],
      })),
    })
    await expect(page.getByText('Imported recovery.json', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Project title', { exact: true })).toHaveValue('Recovery cut')
    await expect(page.getByLabel('Key signature', { exact: true })).toHaveValue('')
    await expect(page.getByRole('list', { name: 'Delivery checklist' })).toContainText('5s uncovered in Upper deck (0:03-0:08)')
    // Also exercise recovery of an older malformed value already saved by the editor.
    await page.evaluate(badKey => {
      const key = 'music-video-generator.project'
      const saved = JSON.parse(localStorage.getItem(key)!)
      saved.inputs.keySignature = badKey
      localStorage.setItem(key, JSON.stringify(saved))
    }, keySignature)
    await page.reload()
    await expect(page.getByLabel('Project title', { exact: true })).toHaveValue('Recovery cut')
    await expect(page.getByLabel('Key signature', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('Scene title', { exact: true })).toHaveCount(2)

    await page.getByRole('button', { name: 'Copy Edit List', exact: true }).click()
    await expect(page.getByText('Copied edit list', { exact: true })).toBeVisible()
    const copied = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
    expect(copied.ready).toBe(false)
    expect(copied.keySignature).toBe('')
    expect(copied.gaps).toEqual([expect.objectContaining({
      sceneTitle: 'Upper deck', startSeconds: 3, endSeconds: 8,
      durationSeconds: 5, timecode: '0:03-0:08',
    })])
    expect(copied.checklist).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'shot-coverage', ok: false }),
      expect.objectContaining({ id: 'key-signature', ok: false }),
    ]))
    const downloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download Edit List', exact: true }).click()
    const download = await downloadEvent
    expect(download.suggestedFilename()).toBe('recovery-cut-edit-list.json')
    const downloaded = JSON.parse(await readFile((await download.path())!, 'utf8'))
    expect(downloaded).toEqual(copied)
    expect(errors).toEqual([])
  })
}
