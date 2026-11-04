import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildMusicVideoEditList,
  createMusicVideoProject,
  loadSavedProject,
  parseProjectPackage,
  type MusicVideoProjectPackage,
  type MusicVideoScene,
} from '../src/project-package.ts'

function readyInputs(runtimeSeconds: number) {
  return {
    songTitle: 'Night Bus',
    artist: 'Axylusion',
    runtimeSeconds,
    bpm: 100,
    keySignature: 'A minor',
    lyricsOrTheme: '',
    narrativePremise: '',
    visualStyle: '',
    aspectRatio: '16:9',
    editPlan: '',
    audienceMood: '',
    locations: [],
    cast: [],
  }
}

function scene(id: string, durationSeconds: number, shotDurations: number[]): MusicVideoScene {
  return {
    id,
    title: `Scene ${id}`,
    section: 'Verse',
    beatWindow: '',
    summary: '',
    durationSeconds,
    shotCount: shotDurations.length,
    location: '',
    visualStyle: '',
    performanceFocus: '',
    cameraEnergy: '',
    notes: '',
    shots: shotDurations.map((durationSeconds, index) => ({
      id: `${id}-shot-${index + 1}`,
      label: `Shot ${index + 1}`,
      durationSeconds,
      cameraMove: 'Hold',
      subject: 'Rider',
      prompt: 'Night bus interior.',
      tags: [],
    })),
  }
}

function packageJson(inputs: Record<string, unknown>) {
  return JSON.stringify({
    formatVersion: 'creative-project-package-v1',
    projectType: 'music-video',
    title: 'Imported',
    inputs,
    scenes: [scene('a', 4, [4])],
  })
}

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

const STORAGE_KEY = 'music-video-generator.project'
const fallback = createMusicVideoProject('Fallback')

describe('music video edit list', () => {
  it('builds timed shots, a prompt batch, and a passing delivery checklist', () => {
    const project = createMusicVideoProject('Night Bus', {
      slug: 'night-bus',
      status: 'ready-for-review',
      inputs: {
        songTitle: 'Night Bus',
        artist: 'Axylusion',
        runtimeSeconds: 8,
        bpm: 100,
        keySignature: 'A minor',
        lyricsOrTheme: 'Last train home.',
        narrativePremise: 'One rider stays on past the depot.',
        visualStyle: 'Sodium street light.',
        aspectRatio: '16:9',
        editPlan: 'Two shots, one hold.',
        audienceMood: 'Restless',
        locations: ['Bus'],
        cast: ['Rider'],
      },
      scenes: [
        {
          id: 'scene-1',
          title: 'Upper deck',
          section: 'Verse',
          beatWindow: '0:00-0:08',
          summary: 'The bus clears the last stop.',
          durationSeconds: 8,
          shotCount: 2,
          location: 'Bus',
          visualStyle: 'Sodium street light.',
          performanceFocus: 'Stillness',
          cameraEnergy: 'Slow',
          notes: '',
          shots: [
            {
              id: 'shot-1',
              label: 'Window',
              durationSeconds: 3,
              cameraMove: 'Hold',
              subject: 'Rider reflected in the window',
              prompt: 'Night bus window, rain, lone rider reflection.',
              tags: ['verse'],
            },
            {
              id: 'shot-2',
              label: 'Aisle',
              durationSeconds: 5,
              cameraMove: 'Push',
              subject: 'Empty aisle',
              prompt: 'Slow push down a wet night-bus aisle.',
              tags: ['verse'],
            },
          ],
        },
      ],
    })
    const editList = buildMusicVideoEditList(project)

    assert.equal(editList.formatVersion, 'music-video-edit-list-v1')
    assert.equal(editList.ready, true)
    assert.equal(editList.plannedRuntimeSeconds, 8)
    assert.deepEqual(
      editList.shots.map((shot) => [shot.shotId, shot.timecode, shot.subject]),
      [
        ['shot-1', '0:00-0:03', 'Rider reflected in the window'],
        ['shot-2', '0:03-0:08', 'Empty aisle'],
      ],
    )
    assert.deepEqual(
      editList.promptBatch.map((item) => item.prompt),
      [
        'Night bus window, rain, lone rider reflection.',
        'Slow push down a wet night-bus aisle.',
      ],
    )
    assert.deepEqual(
      editList.checklist.map((item) => item.ok),
      [true, true, true, true, true, true],
    )
    assert.deepEqual(editList.gaps, [])
  })

  it('flags missing key, prompts, subjects, runtime, and an unusable BPM', () => {
    const project = createMusicVideoProject('Untitled', {
      inputs: {
        songTitle: '',
        artist: '',
        runtimeSeconds: 30,
        bpm: 12,
        keySignature: '  ',
        lyricsOrTheme: '',
        narrativePremise: '',
        visualStyle: '',
        aspectRatio: '16:9',
        editPlan: '',
        audienceMood: '',
        locations: [],
        cast: [],
      },
      scenes: [
        {
          id: 'scene-1',
          title: 'Open',
          section: 'Intro',
          beatWindow: '',
          summary: '',
          durationSeconds: 4,
          shotCount: 1,
          location: '',
          visualStyle: '',
          performanceFocus: '',
          cameraEnergy: '',
          notes: '',
          shots: [
            {
              id: 'shot-1',
              label: 'Blank',
              durationSeconds: 4,
              cameraMove: '',
              subject: '  ',
              prompt: '',
              tags: [],
            },
          ],
        },
      ],
    })
    const editList = buildMusicVideoEditList(project)

    assert.equal(editList.ready, false)
    assert.equal(editList.checklist.find((item) => item.id === 'bpm-range')?.detail, '12 BPM is outside 40–220')
    assert.equal(editList.checklist.find((item) => item.id === 'key-signature')?.ok, false)
    assert.equal(editList.checklist.find((item) => item.id === 'shot-subject')?.detail, '1 shot missing a subject')
    assert.equal(editList.checklist.find((item) => item.id === 'shot-prompt')?.detail, '1 shot missing a prompt')
    assert.equal(editList.checklist.find((item) => item.id === 'runtime-match')?.ok, false)
    assert.equal(editList.shots[0]?.timecode, '0:00-0:04')
  })
})

describe('edit list shot coverage', () => {
  it('does not mark an eight-second scene with one three-second shot as ready', () => {
    const project = createMusicVideoProject('Gapped', {
      inputs: readyInputs(8),
      scenes: [scene('a', 8, [3])],
    })
    const editList = buildMusicVideoEditList(project)
    const coverage = editList.checklist.find((item) => item.id === 'shot-coverage')

    assert.equal(editList.plannedRuntimeSeconds, 8)
    assert.equal(editList.ready, false)
    assert.equal(coverage?.ok, false)
    assert.equal(coverage?.detail, '5s uncovered in Scene a (0:03-0:08)')
    assert.deepEqual(editList.gaps, [
      {
        sceneId: 'a',
        sceneTitle: 'Scene a',
        section: 'Verse',
        startSeconds: 3,
        endSeconds: 8,
        durationSeconds: 5,
        timecode: '0:03-0:08',
      },
    ])
  })

  it('marks scenes whose shots cover the whole duration as ready', () => {
    const project = createMusicVideoProject('Covered', {
      inputs: readyInputs(12),
      scenes: [scene('a', 8, [3, 5]), scene('b', 4, [4])],
    })
    const editList = buildMusicVideoEditList(project)

    assert.equal(editList.ready, true)
    assert.deepEqual(editList.gaps, [])
    assert.equal(
      editList.checklist.find((item) => item.id === 'shot-coverage')?.detail,
      '2 scenes fully covered',
    )
  })

  it('reports each uncovered scene, including a scene with no shots', () => {
    const project = createMusicVideoProject('Two gaps', {
      inputs: readyInputs(14),
      scenes: [scene('a', 8, [3]), scene('b', 6, [])],
    })
    const editList = buildMusicVideoEditList(project)

    assert.equal(editList.ready, false)
    assert.deepEqual(
      editList.gaps.map((gap) => [gap.sceneId, gap.timecode]),
      [
        ['a', '0:03-0:08'],
        ['b', '0:08-0:14'],
      ],
    )
    assert.equal(
      editList.checklist.find((item) => item.id === 'shot-coverage')?.detail,
      '2 gaps, 11s uncovered',
    )
  })
})

describe('imported key signature', () => {
  const badValues: [string, Record<string, unknown>][] = [
    ['null', { keySignature: null }],
    ['a number', { keySignature: 7 }],
    ['missing', {}],
  ]

  for (const [name, keyField] of badValues) {
    it(`does not throw when keySignature is ${name}`, () => {
      const inputs: Record<string, unknown> = { ...readyInputs(4), ...keyField }
      if (!('keySignature' in keyField)) {
        delete inputs.keySignature
      }
      const project = parseProjectPackage(packageJson(inputs))

      assert.equal(project.inputs.keySignature, '')
      const editList = buildMusicVideoEditList(project)
      assert.equal(editList.keySignature, '')
      assert.equal(editList.checklist.find((item) => item.id === 'key-signature')?.ok, false)
    })
  }

  it('saves a normalised value when an imported package is persisted', () => {
    const storage = memoryStorage()
    const imported = parseProjectPackage(packageJson({ ...readyInputs(4), keySignature: null }))
    storage.setItem(STORAGE_KEY, JSON.stringify(imported, null, 2))

    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as MusicVideoProjectPackage
    assert.equal(saved.inputs.keySignature, '')
  })

  it('recovers on reload when a bad value is already in storage', () => {
    const storage = memoryStorage()
    const stored = JSON.parse(packageJson(readyInputs(4)))
    stored.inputs.keySignature = null
    storage.setItem(STORAGE_KEY, JSON.stringify(stored, null, 2))

    const reloaded = loadSavedProject(storage.getItem(STORAGE_KEY), fallback)

    assert.notEqual(reloaded, fallback)
    assert.equal(reloaded.title, 'Imported')
    assert.equal(reloaded.inputs.keySignature, '')
    assert.doesNotThrow(() => buildMusicVideoEditList(reloaded))
  })

  it('keeps the edit list builder safe if a project skips normalisation', () => {
    const project = createMusicVideoProject('Raw', { inputs: readyInputs(4), scenes: [scene('a', 4, [4])] })
    const raw = {
      ...project,
      inputs: { ...project.inputs, keySignature: null as unknown as string },
    }

    assert.equal(buildMusicVideoEditList(raw).keySignature, '')
  })
})
