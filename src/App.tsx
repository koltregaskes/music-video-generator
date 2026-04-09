import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  exportProjectPackage,
  formatMinutes,
  parseProjectPackage,
  slugify,
  type MusicVideoProjectPackage,
  type MusicVideoScene,
  type MusicVideoShot,
} from './project-package'
import { sampleMusicVideoProject } from './sample-project'

const STORAGE_KEY = 'music-video-generator.project'

function App() {
  const [project, setProject] = useState<MusicVideoProjectPackage>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return sampleMusicVideoProject
    }

    try {
      return parseProjectPackage(saved)
    } catch {
      return sampleMusicVideoProject
    }
  })
  const [importMessage, setImportMessage] = useState('Ready')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const persist = (nextProject: MusicVideoProjectPackage) => {
    setProject(nextProject)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProject, null, 2))
  }

  const updateProject = (
    updater: (current: MusicVideoProjectPackage) => MusicVideoProjectPackage,
  ) => {
    persist(updater(project))
  }

  const metrics = useMemo(() => {
    const runtimeSeconds = project.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0)
    const shotCount = project.scenes.reduce((sum, scene) => sum + scene.shots.length, 0)
    const locations = new Set(
      project.scenes
        .map((scene) => scene.location.trim())
        .concat(project.inputs.locations)
        .filter(Boolean),
    )

    return {
      runtimeSeconds,
      shotCount,
      locations: locations.size,
      deliverables: project.outputs.length,
    }
  }, [project])

  const addScene = () => {
    updateProject((current) => ({
      ...current,
      scenes: [
        ...current.scenes,
        {
          id: crypto.randomUUID(),
          title: `Scene ${current.scenes.length + 1}`,
          section: 'Verse',
          beatWindow: '',
          summary: 'Describe the emotional beat, blocking, and visual turn here.',
          durationSeconds: 12,
          shotCount: 1,
          location: '',
          visualStyle: current.inputs.visualStyle,
          performanceFocus: '',
          cameraEnergy: 'Medium',
          notes: '',
          shots: [
            {
              id: crypto.randomUUID(),
              label: 'Anchor shot',
              durationSeconds: 4,
              cameraMove: '',
              subject: '',
              prompt: '',
              tags: [],
            },
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const addShot = (sceneId: string) => {
    updateProject((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              shots: [
                ...scene.shots,
                {
                  id: crypto.randomUUID(),
                  label: `Shot ${scene.shots.length + 1}`,
                  durationSeconds: 4,
                  cameraMove: '',
                  subject: '',
                  prompt: '',
                  tags: [],
                },
              ],
              shotCount: scene.shots.length + 1,
            }
          : scene,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const addPrompt = () => {
    updateProject((current) => ({
      ...current,
      prompts: [
        ...current.prompts,
        {
          id: crypto.randomUUID(),
          label: `Prompt ${current.prompts.length + 1}`,
          prompt:
            'Write the exact visual prompt here, including lens, lighting, camera motion, palette, and continuity notes.',
          tags: ['visual-style'],
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const addAsset = () => {
    updateProject((current) => ({
      ...current,
      assets: [
        ...current.assets,
        {
          id: crypto.randomUUID(),
          label: `Asset ${current.assets.length + 1}`,
          type: 'reference',
          source: 'Reference board',
          status: 'planned',
          notes: 'Add the shot board, style frame, or reference clip you need.',
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const addOutput = () => {
    updateProject((current) => ({
      ...current,
      outputs: [
        ...current.outputs,
        {
          id: crypto.randomUUID(),
          label: `Deliverable ${current.outputs.length + 1}`,
          status: 'planned',
          target: 'Primary release target',
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(project, null, 2))
      setImportMessage('Copied package JSON')
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : 'Copy failed. Check browser clipboard permissions.',
      )
    }
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      persist(parseProjectPackage(text))
      setImportMessage(`Imported ${file.name}`)
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : 'Import failed. Check the JSON package format.',
      )
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Editorial Music Video Planner</span>
          <h1>Music Video Generator</h1>
          <p>
            Shape a song into a full production package with scene architecture, shot prompts,
            moodboards, release outputs, and a clean export the rest of the creative stack can use.
          </p>
          <div className="hero-actions">
            <button onClick={() => exportProjectPackage(project)}>Export Package</button>
            <button className="secondary" onClick={handleCopy}>
              Copy JSON
            </button>
            <button className="secondary" onClick={handleImportClick}>
              Import Package
            </button>
            <button
              className="ghost"
              onClick={() => {
                persist(sampleMusicVideoProject)
                setImportMessage('Sample project loaded')
              }}
            >
              Load Sample
            </button>
          </div>
          <p className="helper-text">{importMessage}</p>
        </div>
        <div className="metric-grid">
          <MetricCard label="Scenes" value={String(project.scenes.length)} />
          <MetricCard label="Runtime" value={formatMinutes(metrics.runtimeSeconds)} />
          <MetricCard label="Shot Beats" value={String(metrics.shotCount)} />
          <MetricCard label="Locations" value={String(metrics.locations)} />
          <MetricCard label="Deliverables" value={String(metrics.deliverables)} />
          <MetricCard
            label="BPM / Key"
            value={`${project.inputs.bpm} / ${project.inputs.keySignature || 'TBD'}`}
          />
        </div>
      </header>

      <main className="workspace-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Brief</span>
              <h2>Song and creative direction</h2>
            </div>
          </div>
          <div className="field-grid">
            <Field
              label="Project title"
              value={project.title}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  title: value,
                  slug: slugify(value),
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <Field
              label="Song title"
              value={project.inputs.songTitle}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: { ...current.inputs, songTitle: value },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <Field
              label="Artist"
              value={project.inputs.artist}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: { ...current.inputs, artist: value },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <Field
              label="Runtime (seconds)"
              value={String(project.inputs.runtimeSeconds)}
              type="number"
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: { ...current.inputs, runtimeSeconds: Number(value) || 0 },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <Field
              label="BPM"
              value={String(project.inputs.bpm)}
              type="number"
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: { ...current.inputs, bpm: Number(value) || 0 },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <Field
              label="Key signature"
              value={project.inputs.keySignature}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: { ...current.inputs, keySignature: value },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
          </div>
          <TextArea
            label="Creative summary"
            value={project.summary}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                summary: value,
                updatedAt: new Date().toISOString(),
              }))
            }
          />
          <TextArea
            label="Lyrics or theme"
            value={project.inputs.lyricsOrTheme}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                inputs: { ...current.inputs, lyricsOrTheme: value },
                updatedAt: new Date().toISOString(),
              }))
            }
          />
          <TextArea
            label="Narrative premise"
            value={project.inputs.narrativePremise}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                inputs: { ...current.inputs, narrativePremise: value },
                updatedAt: new Date().toISOString(),
              }))
            }
          />
          <div className="field-grid">
            <TextArea
              label="Locations"
              value={project.inputs.locations.join('\n')}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: {
                    ...current.inputs,
                    locations: splitLines(value),
                  },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <TextArea
              label="Cast and performance setup"
              value={project.inputs.cast.join('\n')}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: {
                    ...current.inputs,
                    cast: splitLines(value),
                  },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
          </div>
          <TextArea
            label="Visual style"
            value={project.inputs.visualStyle}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                inputs: { ...current.inputs, visualStyle: value },
                updatedAt: new Date().toISOString(),
              }))
            }
          />
          <TextArea
            label="Edit and timing plan"
            value={project.inputs.editPlan}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                inputs: { ...current.inputs, editPlan: value },
                updatedAt: new Date().toISOString(),
              }))
            }
          />
        </section>

        <section className="panel panel-full">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Scene Architecture</span>
              <h2>Build the storyboard spine</h2>
            </div>
            <button className="secondary" onClick={addScene}>
              Add Scene
            </button>
          </div>
          <div className="stack-list">
            {project.scenes.map((scene, index) => (
              <SceneEditor
                key={scene.id}
                scene={scene}
                sceneIndex={index}
                onChange={(patch) => updateScene(project, scene.id, persist, patch)}
                onRemove={() =>
                  updateProject((current) => ({
                    ...current,
                    scenes: current.scenes.filter((item) => item.id !== scene.id),
                    updatedAt: new Date().toISOString(),
                  }))
                }
                onAddShot={() => addShot(scene.id)}
                onUpdateShot={(shotId, patch) => updateShot(project, scene.id, shotId, persist, patch)}
              />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Prompt Pack</span>
              <h2>Master prompts and reference assets</h2>
            </div>
            <div className="inline-actions">
              <button className="secondary" onClick={addPrompt}>
                Add Prompt
              </button>
              <button className="secondary" onClick={addAsset}>
                Add Asset
              </button>
            </div>
          </div>
          <div className="stack-list">
            {project.prompts.map((prompt, index) => (
              <article className="stack-card" key={prompt.id}>
                <div className="stack-header compact">
                  <strong>{prompt.label}</strong>
                  <button
                    className="ghost tiny"
                    onClick={() =>
                      updateProject((current) => ({
                        ...current,
                        prompts: current.prompts.filter((item) => item.id !== prompt.id),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid">
                  <Field
                    label="Label"
                    value={prompt.label}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        prompts: current.prompts.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <Field
                    label="Tags"
                    value={prompt.tags.join(', ')}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        prompts: current.prompts.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, tags: splitCommaList(value) } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <TextArea
                  label="Prompt"
                  value={prompt.prompt}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      prompts: current.prompts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, prompt: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </article>
            ))}
            {project.assets.map((asset, index) => (
              <article className="stack-card" key={asset.id}>
                <div className="stack-header compact">
                  <strong>{asset.label}</strong>
                  <button
                    className="ghost tiny"
                    onClick={() =>
                      updateProject((current) => ({
                        ...current,
                        assets: current.assets.filter((item) => item.id !== asset.id),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid">
                  <Field
                    label="Label"
                    value={asset.label}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        assets: current.assets.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <Field
                    label="Type"
                    value={asset.type}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        assets: current.assets.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, type: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <div className="field-grid">
                  <Field
                    label="Source"
                    value={asset.source}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        assets: current.assets.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, source: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <Field
                    label="Status"
                    value={asset.status}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        assets: current.assets.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, status: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <TextArea
                  label="Notes"
                  value={asset.notes}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      assets: current.assets.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, notes: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Delivery</span>
              <h2>Release outputs and notes</h2>
            </div>
            <button className="secondary" onClick={addOutput}>
              Add Output
            </button>
          </div>
          <div className="stack-list">
            {project.outputs.map((output, index) => (
              <article className="stack-card" key={output.id}>
                <div className="stack-header compact">
                  <strong>{output.label}</strong>
                  <button
                    className="ghost tiny"
                    onClick={() =>
                      updateProject((current) => ({
                        ...current,
                        outputs: current.outputs.filter((item) => item.id !== output.id),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid">
                  <Field
                    label="Label"
                    value={output.label}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        outputs: current.outputs.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <Field
                    label="Status"
                    value={output.status}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        outputs: current.outputs.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, status: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <Field
                  label="Target"
                  value={output.target}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      outputs: current.outputs.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, target: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </article>
            ))}
          </div>
          <TextArea
            label="Working notes"
            value={project.notes.join('\n')}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                notes: splitLines(value),
                updatedAt: new Date().toISOString(),
              }))
            }
          />
        </section>
      </main>

      <input
        ref={fileInputRef}
        className="hidden-file-input"
        type="file"
        accept="application/json"
        onChange={handleImport}
      />
    </div>
  )
}

type SceneEditorProps = {
  scene: MusicVideoScene
  sceneIndex: number
  onChange: (patch: Partial<MusicVideoScene>) => void
  onRemove: () => void
  onAddShot: () => void
  onUpdateShot: (shotId: string, patch: Partial<MusicVideoShot>) => void
}

function SceneEditor({
  scene,
  sceneIndex,
  onChange,
  onRemove,
  onAddShot,
  onUpdateShot,
}: SceneEditorProps) {
  return (
    <article className="stack-card cinematic-card">
      <div className="stack-header">
        <div>
          <strong>{scene.title}</strong>
          <p className="card-caption">
            Scene {sceneIndex + 1} {scene.section ? `• ${scene.section}` : ''}
          </p>
        </div>
        <div className="inline-actions">
          <button className="secondary tiny" onClick={onAddShot}>
            Add Shot
          </button>
          <button className="ghost tiny" onClick={onRemove}>
            Remove Scene
          </button>
        </div>
      </div>
      <div className="field-grid three-up">
        <Field label="Scene title" value={scene.title} onChange={(value) => onChange({ title: value })} />
        <Field label="Section" value={scene.section} onChange={(value) => onChange({ section: value })} />
        <Field
          label="Beat window"
          value={scene.beatWindow}
          onChange={(value) => onChange({ beatWindow: value })}
        />
        <Field
          label="Duration"
          value={String(scene.durationSeconds)}
          type="number"
          onChange={(value) => onChange({ durationSeconds: Number(value) || 0 })}
        />
        <Field label="Location" value={scene.location} onChange={(value) => onChange({ location: value })} />
        <Field
          label="Camera energy"
          value={scene.cameraEnergy}
          onChange={(value) => onChange({ cameraEnergy: value })}
        />
      </div>
      <TextArea label="Scene summary" value={scene.summary} onChange={(value) => onChange({ summary: value })} />
      <div className="field-grid">
        <TextArea
          label="Performance focus"
          value={scene.performanceFocus}
          onChange={(value) => onChange({ performanceFocus: value })}
        />
        <TextArea
          label="Visual style"
          value={scene.visualStyle}
          onChange={(value) => onChange({ visualStyle: value })}
        />
      </div>
      <TextArea label="Production notes" value={scene.notes} onChange={(value) => onChange({ notes: value })} />
      <div className="subsection-heading">
        <span>Shot plan</span>
        <strong>{scene.shots.length} planned shots</strong>
      </div>
      <div className="shot-grid">
        {scene.shots.map((shot) => (
          <div className="shot-card" key={shot.id}>
            <div className="field-grid">
              <Field label="Shot label" value={shot.label} onChange={(value) => onUpdateShot(shot.id, { label: value })} />
              <Field
                label="Duration"
                value={String(shot.durationSeconds)}
                type="number"
                onChange={(value) => onUpdateShot(shot.id, { durationSeconds: Number(value) || 0 })}
              />
            </div>
            <div className="field-grid">
              <Field
                label="Camera move"
                value={shot.cameraMove}
                onChange={(value) => onUpdateShot(shot.id, { cameraMove: value })}
              />
              <Field label="Subject" value={shot.subject} onChange={(value) => onUpdateShot(shot.id, { subject: value })} />
            </div>
            <TextArea label="Prompt" value={shot.prompt} onChange={(value) => onUpdateShot(shot.id, { prompt: value })} />
            <Field
              label="Tags"
              value={shot.tags.join(', ')}
              onChange={(value) => onUpdateShot(shot.id, { tags: splitCommaList(value) })}
            />
          </div>
        ))}
      </div>
    </article>
  )
}

function updateScene(
  project: MusicVideoProjectPackage,
  sceneId: string,
  persist: (project: MusicVideoProjectPackage) => void,
  patch: Partial<MusicVideoScene>,
) {
  persist({
    ...project,
    scenes: project.scenes.map((scene) => {
      if (scene.id !== sceneId) {
        return scene
      }

      const nextScene = { ...scene, ...patch }
      return { ...nextScene, shotCount: nextScene.shots.length }
    }),
    updatedAt: new Date().toISOString(),
  })
}

function updateShot(
  project: MusicVideoProjectPackage,
  sceneId: string,
  shotId: string,
  persist: (project: MusicVideoProjectPackage) => void,
  patch: Partial<MusicVideoShot>,
) {
  persist({
    ...project,
    scenes: project.scenes.map((scene) =>
      scene.id === sceneId
        ? {
            ...scene,
            shots: scene.shots.map((shot) => (shot.id === shotId ? { ...shot, ...patch } : shot)),
            shotCount: scene.shots.length,
          }
        : scene,
    ),
    updatedAt: new Date().toISOString(),
  })
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function splitCommaList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

type MetricCardProps = { label: string; value: string }

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
}

function Field({ label, value, onChange, type = 'text' }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

type TextAreaProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <label className="field field-textarea">
      <span>{label}</span>
      <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export default App
