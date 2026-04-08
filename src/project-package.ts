export type CreativeProjectType =
  | 'music-video'
  | 'comic-book-video'
  | 'comic-book'
  | 'creative-canvas-workflow'
  | 'planning-estimate'

export type CreativePrompt = {
  id: string
  label: string
  prompt: string
  tags: string[]
}

export type CreativeAsset = {
  id: string
  label: string
  type: string
  source: string
  status: string
  notes: string
}

export type CreativeOutput = {
  id: string
  label: string
  status: string
  target: string
}

export type MusicVideoScene = {
  id: string
  title: string
  summary: string
  durationSeconds: number
  shotCount: number
  visualStyle: string
  performanceFocus: string
  notes: string
}

export type CreativeProjectPackageV1 = {
  formatVersion: 'creative-project-package-v1'
  projectType: CreativeProjectType
  title: string
  slug: string
  summary: string
  status: string
  createdAt: string
  updatedAt: string
  inputs: Record<string, unknown>
  scenes: unknown[]
  assets: CreativeAsset[]
  prompts: CreativePrompt[]
  outputs: CreativeOutput[]
  metrics: Record<string, unknown>
  notes: string[]
}

export type MusicVideoInputs = {
  songTitle: string
  artist: string
  runtimeSeconds: number
  lyricsOrTheme: string
  visualStyle: string
  aspectRatio: string
  editPlan: string
}

export type MusicVideoProjectPackage = Omit<
  CreativeProjectPackageV1,
  'projectType' | 'inputs' | 'scenes'
> & {
  projectType: 'music-video'
  inputs: MusicVideoInputs
  scenes: MusicVideoScene[]
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createMusicVideoProject(
  title: string,
  partial?: Partial<MusicVideoProjectPackage>,
): MusicVideoProjectPackage {
  const now = new Date().toISOString()
  return {
    formatVersion: 'creative-project-package-v1',
    projectType: 'music-video',
    title,
    slug: slugify(title),
    summary: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    inputs: {
      songTitle: '',
      artist: '',
      runtimeSeconds: 180,
      lyricsOrTheme: '',
      visualStyle: '',
      aspectRatio: '16:9',
      editPlan: '',
    },
    scenes: [],
    assets: [],
    prompts: [],
    outputs: [],
    metrics: {
      revisionBudget: 2,
      targetDeliverables: ['teaser', 'full-video', 'vertical-cut'],
    },
    notes: [],
    ...partial,
  }
}

export function parseProjectPackage(raw: string): MusicVideoProjectPackage {
  const parsed = JSON.parse(raw) as Partial<MusicVideoProjectPackage>

  if (parsed.formatVersion !== 'creative-project-package-v1') {
    throw new Error('Unsupported format. Expected creative-project-package-v1.')
  }

  if (parsed.projectType !== 'music-video') {
    throw new Error('This package is not a music video project.')
  }

  return createMusicVideoProject(parsed.title ?? 'Imported Music Video Project', {
    ...parsed,
    inputs: {
      songTitle: '',
      artist: '',
      runtimeSeconds: 0,
      lyricsOrTheme: '',
      visualStyle: '',
      aspectRatio: '16:9',
      editPlan: '',
      ...(parsed.inputs ?? {}),
    },
    scenes: Array.isArray(parsed.scenes) ? (parsed.scenes as MusicVideoScene[]) : [],
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
    outputs: Array.isArray(parsed.outputs) ? parsed.outputs : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    metrics: parsed.metrics ?? {},
  })
}

export function exportProjectPackage(project: MusicVideoProjectPackage) {
  const file = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.slug || 'music-video-project'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function formatMinutes(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
