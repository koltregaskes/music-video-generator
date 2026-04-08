import { createMusicVideoProject, type MusicVideoProjectPackage } from './project-package'

export const sampleMusicVideoProject: MusicVideoProjectPackage = createMusicVideoProject(
  'Neon Run',
  {
    summary:
      'A kinetic synth-pop release plan built around rain-slick streets, rooftop release, and a final crowd catharsis cut.',
    status: 'ready-for-review',
    inputs: {
      songTitle: 'Neon Run',
      artist: 'Axylusion',
      runtimeSeconds: 214,
      bpm: 124,
      keySignature: 'F# minor',
      lyricsOrTheme:
        'Theme: motion through rain, reflection, and release. Key images: headlights in puddles, rooftop silhouettes, late-night escape energy.',
      narrativePremise:
        'A solitary walk through the city gradually turns into a collective release as more performers and dancers join the frame.',
      visualStyle: 'Wet neon realism with manga framing and soft anamorphic bloom.',
      aspectRatio: '16:9 master with 9:16 social selects',
      editPlan:
        'Open slow and observational, build into aggressive chorus cross-cutting, then land the bridge in a close-up rooftop performance section.',
      audienceMood: 'Cinematic, urgent, magnetic, slightly romantic',
      locations: ['Rain street', 'Parking deck', 'Rooftop', 'Tunnel underpass'],
      cast: ['Lead performer', 'Two dancers', 'Three crowd extras'],
    },
    scenes: [
      {
        id: 'scene-1',
        title: 'Rain Walk Intro',
        section: 'Intro',
        beatWindow: '0:00 - 0:26',
        summary: 'Wide drifting opener introducing the protagonist and the reflective city.',
        durationSeconds: 26,
        shotCount: 4,
        location: 'Rain street',
        visualStyle: 'Blue-magenta reflections, slow dolly, distant taillights',
        performanceFocus: 'Isolation and anticipation',
        cameraEnergy: 'Low / gliding',
        notes: 'Leave negative space for titles and social cut overlays.',
        shots: [
          {
            id: 'shot-1',
            label: 'Street establish',
            durationSeconds: 6,
            cameraMove: 'Slow dolly forward',
            subject: 'Lead performer crossing the street line',
            prompt:
              'Night street after rain, glossy asphalt, cyan and magenta reflections, solitary singer walking toward camera, cinematic realism, soft anamorphic bloom.',
            tags: ['establishing', 'hero', '16:9'],
          },
          {
            id: 'shot-2',
            label: 'Boot splash detail',
            durationSeconds: 3,
            cameraMove: 'Low locked-off insert',
            subject: 'Boots cutting through puddles',
            prompt:
              'Close-up of boots splashing through neon puddles, sharp reflections, high texture, music-video insert shot.',
            tags: ['detail', 'insert'],
          },
          {
            id: 'shot-3',
            label: 'Mirror window pass',
            durationSeconds: 7,
            cameraMove: 'Side tracking',
            subject: 'Reflected profile in storefront glass',
            prompt:
              'Side-tracking performance profile reflected in wet storefront glass, layered city lights, moody cinematic color.',
            tags: ['reflection', 'profile'],
          },
          {
            id: 'shot-4',
            label: 'Title silhouette',
            durationSeconds: 10,
            cameraMove: 'Static wide',
            subject: 'Lead framed beneath overpass light',
            prompt:
              'Wide cinematic silhouette under overpass sodium light, rain haze, title-card negative space, premium music video frame.',
            tags: ['title-card', 'wide'],
          },
        ],
      },
      {
        id: 'scene-2',
        title: 'Chorus Rush',
        section: 'Chorus',
        beatWindow: '0:52 - 1:30',
        summary: 'Performance fragments, alley cuts, moving lights, and hand-held momentum.',
        durationSeconds: 38,
        shotCount: 5,
        location: 'Tunnel underpass',
        visualStyle: 'Fast handheld rhythm with neon flare streaks',
        performanceFocus: 'Release and confidence',
        cameraEnergy: 'High / handheld',
        notes: 'Build this as the source of the vertical teaser.',
        shots: [
          {
            id: 'shot-5',
            label: 'Tunnel chorus front',
            durationSeconds: 8,
            cameraMove: 'Handheld push-in',
            subject: 'Lead singing direct to lens',
            prompt:
              'Handheld tunnel performance, direct-to-camera singer, fast lights, intense backlight, premium music-video realism.',
            tags: ['chorus', 'performance'],
          },
          {
            id: 'shot-6',
            label: 'Dancer spin cutaway',
            durationSeconds: 5,
            cameraMove: 'Orbiting mid-shot',
            subject: 'One dancer turning into frame flare',
            prompt:
              'Single dancer spinning through neon flare streaks, glossy underpass, motion-blur accents, cinematic choreography insert.',
            tags: ['dance', 'kinetic'],
          },
          {
            id: 'shot-7',
            label: 'Crowd impact beat',
            durationSeconds: 4,
            cameraMove: 'Whip pan',
            subject: 'Crowd joining the frame on beat drop',
            prompt:
              'Crowd burst entering music-video frame on beat, urban underpass, high-energy whip pan, cinematic lighting.',
            tags: ['crowd', 'impact'],
          },
          {
            id: 'shot-8',
            label: 'Toplight performance',
            durationSeconds: 9,
            cameraMove: 'Circular handheld',
            subject: 'Lead and dancers under one harsh light',
            prompt:
              'Circular handheld performance under hard toplight, dark edges, confident expression, modern cinematic music video.',
            tags: ['performance', 'hero'],
          },
          {
            id: 'shot-9',
            label: 'Final chorus detail',
            durationSeconds: 12,
            cameraMove: 'Crash zoom into profile',
            subject: 'Lead eyes and mic detail',
            prompt:
              'Crash zoom music-video close-up, eyes and microphone catching neon reflections, emotional intensity, premium detail shot.',
            tags: ['close-up', 'emotive'],
          },
        ],
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
          'Cinematic night street, wet asphalt reflecting magenta and cyan neon, solitary singer moving toward camera, shallow depth of field, anamorphic bloom, light rain.',
        tags: ['hero', 'intro', 'rain'],
      },
      {
        id: 'prompt-2',
        label: 'Tunnel chorus look',
        prompt:
          'Fast-moving handheld performance in neon tunnel, intense backlights, expressive dance fragments, glossy urban palette, cinematic realism.',
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
        target: '9:16 chorus cut',
      },
      {
        id: 'output-3',
        label: 'Rooftop hook loop',
        status: 'planned',
        target: 'Looping social hook asset',
      },
    ],
    metrics: {
      revisionBudget: 3,
      targetDeliverables: ['16:9 master', '9:16 teaser', 'hook loop'],
    },
    notes: [
      'Keep all prompt language aligned with the night-rain continuity.',
      'The teaser should come from Scene 2 first, then Scene 1 pickups.',
    ],
  },
)
