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

export type MusicVideoShot = {
  id: string
  label: string
  durationSeconds: number
  cameraMove: string
  subject: string
  prompt: string
  tags: string[]
}

export type MusicVideoScene = {
  id: string
  title: string
  section: string
  beatWindow: string
  summary: string
  durationSeconds: number
  shotCount: number
  location: string
  visualStyle: string
  performanceFocus: string
  cameraEnergy: string
  notes: string
  shots: MusicVideoShot[]
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
  bpm: number
  keySignature: string
  lyricsOrTheme: string
  narrativePremise: string
  visualStyle: string
  aspectRatio: string
  editPlan: string
  audienceMood: string
  locations: string[]
  cast: string[]
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

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : []
}

function createShot(partial?: Partial<MusicVideoShot>): MusicVideoShot {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    label: partial?.label ?? 'New shot',
    durationSeconds: partial?.durationSeconds ?? 4,
    cameraMove: partial?.cameraMove ?? '',
    subject: partial?.subject ?? '',
    prompt: partial?.prompt ?? '',
    tags: normalizeList(partial?.tags),
  }
}

function createScene(partial?: Partial<MusicVideoScene>): MusicVideoScene {
  const shots = Array.isArray(partial?.shots) ? partial.shots.map((shot) => createShot(shot)) : []

  return {
    id: partial?.id ?? crypto.randomUUID(),
    title: partial?.title ?? 'New scene',
    section: partial?.section ?? 'Verse',
    beatWindow: partial?.beatWindow ?? '',
    summary: partial?.summary ?? '',
    durationSeconds: partial?.durationSeconds ?? 12,
    shotCount: partial?.shotCount ?? (shots.length || 3),
    location: partial?.location ?? '',
    visualStyle: partial?.visualStyle ?? '',
    performanceFocus: partial?.performanceFocus ?? '',
    cameraEnergy: partial?.cameraEnergy ?? '',
    notes: partial?.notes ?? '',
    shots,
  }
}

export function createMusicVideoProject(
  title: string,
  partial?: Partial<MusicVideoProjectPackage>,
): MusicVideoProjectPackage {
  const now = new Date().toISOString()
  const nextTitle = partial?.title ?? title
  const inputs: MusicVideoInputs = {
    songTitle: '',
    artist: '',
    runtimeSeconds: 180,
    bpm: 120,
    keySignature: '',
    lyricsOrTheme: '',
    narrativePremise: '',
    visualStyle: '',
    aspectRatio: '16:9',
    editPlan: '',
    audienceMood: '',
    locations: [] as string[],
    cast: [] as string[],
    ...(partial?.inputs ?? {}),
  }
  inputs.locations = normalizeList(partial?.inputs?.locations)
  inputs.cast = normalizeList(partial?.inputs?.cast)
  const scenes = Array.isArray(partial?.scenes)
    ? partial.scenes.map((scene) => createScene(scene))
    : []
  const assets = Array.isArray(partial?.assets) ? partial.assets : []
  const prompts = Array.isArray(partial?.prompts) ? partial.prompts : []
  const outputs = Array.isArray(partial?.outputs) ? partial.outputs : []
  const metrics = partial?.metrics ?? {
    revisionBudget: 2,
    targetDeliverables: ['16:9 master', '9:16 teaser'],
  }
  const notes = normalizeList(partial?.notes)

  return {
    formatVersion: 'creative-project-package-v1',
    projectType: 'music-video',
    title: nextTitle,
    slug: partial?.slug ?? slugify(nextTitle),
    summary: partial?.summary ?? '',
    status: partial?.status ?? 'draft',
    createdAt: partial?.createdAt ?? now,
    updatedAt: partial?.updatedAt ?? now,
    inputs,
    scenes,
    assets,
    prompts,
    outputs,
    metrics,
    notes,
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
