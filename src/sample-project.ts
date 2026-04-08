import { createMusicVideoProject, type MusicVideoProjectPackage } from './project-package'

export const sampleMusicVideoProject: MusicVideoProjectPackage = createMusicVideoProject(
  'Neon Run',
  {
    summary:
      'A kinetic synth-pop video that tracks one protagonist through a city that shifts from lonely neon drift to full collective release.',
    status: 'ready-for-review',
    inputs: {
      songTitle: 'Neon Run',
      artist: 'Axylusion',
      runtimeSeconds: 214,
      lyricsOrTheme:
        'Theme: motion through rain, reflection, and release. Key lyric images: headlights in puddles, rooftop silhouettes, late-night escape energy.',
      visualStyle: 'Wet neon realism with manga framing and soft anamorphic bloom.',
      aspectRatio: '16:9 / 9:16 companion cut',
      editPlan:
        'Open slow and observational, build into fast cross-cutting for the chorus, then land the bridge in a calmer close-up performance section.',
    },
    scenes: [
      {
        id: 'scene-1',
        title: 'Rain Walk Intro',
        summary: 'Wide drifting opener introducing the protagonist and the reflective city.',
        durationSeconds: 26,
        shotCount: 8,
        visualStyle: 'Blue-magenta reflections, slow dolly, distant taillights',
        performanceFocus: 'Isolation and anticipation',
        notes: 'Hold enough negative space for title cards if needed.',
      },
      {
        id: 'scene-2',
        title: 'Chorus Rush',
        summary: 'Performance fragments, alley cuts, moving lights, and hand-held momentum.',
        durationSeconds: 38,
        shotCount: 14,
        visualStyle: 'Fast handheld rhythm with neon flare streaks',
        performanceFocus: 'Release and confidence',
        notes: 'Use three recurring motifs for continuity across clips.',
      },
    ],
    assets: [
      {
        id: 'asset-1',
        label: 'City moodboard',
        type: 'reference',
        source: 'Still frame pack',
        status: 'ready',
        notes: 'Rain, rooftops, tunnels, reflective roads.',
      },
      {
        id: 'asset-2',
        label: 'Wardrobe continuity',
        type: 'wardrobe',
        source: 'Costume board',
        status: 'planned',
        notes: 'Black coat, reflective trim, silver mic prop.',
      },
    ],
    prompts: [
      {
        id: 'prompt-1',
        label: 'Hero walking plate',
        prompt:
          'Cinematic night street, wet asphalt reflecting magenta and cyan neon, solitary singer moving toward camera, shallow depth of field, anamorphic bloom, light rain, grounded realistic texture.',
        tags: ['hero', 'intro', 'rain', '16:9'],
      },
      {
        id: 'prompt-2',
        label: 'Chorus kinetic shot',
        prompt:
          'Fast-moving handheld performance shot in neon alley, intense backlights, motion blur accents, expressive dance fragments, glossy urban palette, sharp contrast, cinematic realism.',
        tags: ['chorus', 'performance', 'movement'],
      },
    ],
    outputs: [
      {
        id: 'output-1',
        label: 'Full video',
        status: 'planned',
        target: 'Primary 16:9 master',
      },
      {
        id: 'output-2',
        label: 'Vertical teaser',
        status: 'planned',
        target: '9:16 social cut',
      },
    ],
    metrics: {
      revisionBudget: 3,
      targetDeliverables: ['16:9 master', '9:16 teaser', 'looping hook cut'],
    },
    notes: [
      'Keep all prompt language aligned with the night-rain continuity.',
      'Build the vertical cut from the chorus and bridge first.',
    ],
  },
)
