import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildMusicVideoEditList, createMusicVideoProject } from '../src/project-package.ts'

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
      [true, true, true, true, true],
    )
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
