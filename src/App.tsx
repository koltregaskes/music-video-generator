import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  exportProjectPackage,
  formatMinutes,
  parseProjectPackage,
  slugify,
  type CreativeAsset,
  type CreativePrompt,
  type MusicVideoProjectPackage,
  type MusicVideoScene,
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

  const addScene = () => {
    updateProject((current) => {
      const nextSceneNumber = current.scenes.length + 1
      const scene: MusicVideoScene = {
        id: crypto.randomUUID(),
        title: `Scene ${nextSceneNumber}`,
        summary: 'Describe the visual beat, movement, and mood.',
        durationSeconds: 12,
        shotCount: 5,
        visualStyle: current.inputs.visualStyle,
        performanceFocus: '',
        notes: '',
      }

      return {
        ...current,
        scenes: [...current.scenes, scene],
        updatedAt: new Date().toISOString(),
      }
    })
  }

  const addPrompt = () => {
    updateProject((current) => {
      const prompt: CreativePrompt = {
        id: crypto.randomUUID(),
        label: `Prompt ${current.prompts.length + 1}`,
        prompt:
          'Write the exact visual prompt here, including lens, lighting, camera motion, palette, and continuity notes.',
        tags: ['shot', 'visual-style'],
      }

      return {
        ...current,
        prompts: [...current.prompts, prompt],
        updatedAt: new Date().toISOString(),
      }
    })
  }

  const addAsset = () => {
    updateProject((current) => {
      const asset: CreativeAsset = {
        id: crypto.randomUUID(),
        label: `Asset ${current.assets.length + 1}`,
        type: 'reference',
        source: 'Reference board',
        status: 'planned',
        notes: 'Add the shot board, style frame, or reference clip you need.',
      }

      return {
        ...current,
        assets: [...current.assets, asset],
        updatedAt: new Date().toISOString(),
      }
    })
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

  const handleExport = () => {
    exportProjectPackage(project)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
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

  const metrics = useMemo(() => {
    const runtimeSeconds = project.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0)
    const shotCount = project.scenes.reduce((sum, scene) => sum + scene.shotCount, 0)
    const revisionBudget = Number(project.metrics.revisionBudget ?? 0)

    return {
      runtimeSeconds,
      shotCount,
      revisionBudget,
      assetCount: project.assets.length,
    }
  }, [project])

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Creative Package Studio</span>
          <h1>Music Video Generator</h1>
          <p>
            Turn a track, theme, or lyric sheet into a structured production package with
            scenes, prompts, style references, asset plans, and exportable creative metadata.
          </p>
          <div className="hero-actions">
            <button onClick={handleExport}>Export Package</button>
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
          <MetricCard label="Assets" value={String(metrics.assetCount)} />
          <MetricCard label="Revision Budget" value={String(metrics.revisionBudget)} />
        </div>
      </header>

      <main className="workspace-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Project</span>
              <h2>Song and brief</h2>
            </div>
          </div>
          <div className="field-grid">
            <LabeledInput
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
            <LabeledInput
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
            <LabeledInput
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
            <LabeledInput
              label="Target runtime (seconds)"
              value={String(project.inputs.runtimeSeconds)}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: {
                    ...current.inputs,
                    runtimeSeconds: Number(value) || 0,
                  },
                  updatedAt: new Date().toISOString(),
                }))
              }
              type="number"
            />
          </div>
          <LabeledTextarea
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
          <LabeledTextarea
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
          <div className="field-grid">
            <LabeledInput
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
            <LabeledInput
              label="Primary ratio"
              value={project.inputs.aspectRatio}
              onChange={(value) =>
                updateProject((current) => ({
                  ...current,
                  inputs: { ...current.inputs, aspectRatio: value },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
          </div>
          <LabeledTextarea
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
          <LabeledTextarea
            label="Working notes"
            value={project.notes.join('\n')}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                notes: value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
                updatedAt: new Date().toISOString(),
              }))
            }
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Structure</span>
              <h2>Scene list builder</h2>
            </div>
            <button className="secondary" onClick={addScene}>
              Add Scene
            </button>
          </div>
          <div className="stack-list">
            {project.scenes.map((scene, index) => (
              <article className="stack-card" key={scene.id}>
                <div className="stack-header">
                  <strong>{scene.title}</strong>
                  <button
                    className="ghost tiny"
                    onClick={() =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.filter((item) => item.id !== scene.id),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="field-grid">
                  <LabeledInput
                    label="Scene title"
                    value={scene.title}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, title: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <LabeledInput
                    label="Duration"
                    value={String(scene.durationSeconds)}
                    type="number"
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, durationSeconds: Number(value) || 0 }
                            : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <LabeledInput
                    label="Shot count"
                    value={String(scene.shotCount)}
                    type="number"
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, shotCount: Number(value) || 0 } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <LabeledInput
                    label="Performance focus"
                    value={scene.performanceFocus}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, performanceFocus: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <LabeledTextarea
                  label="Scene summary"
                  value={scene.summary}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      scenes: current.scenes.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, summary: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <div className="field-grid">
                  <LabeledInput
                    label="Visual style reference"
                    value={scene.visualStyle}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, visualStyle: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <LabeledInput
                    label="Scene notes"
                    value={scene.notes}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, notes: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Prompt Pack</span>
              <h2>Visual prompts and references</h2>
            </div>
            <button className="secondary" onClick={addPrompt}>
              Add Prompt
            </button>
          </div>
          <div className="stack-list">
            {project.prompts.map((prompt, index) => (
              <article className="stack-card" key={prompt.id}>
                <div className="field-grid">
                  <LabeledInput
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
                  <LabeledInput
                    label="Tags"
                    value={prompt.tags.join(', ')}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        prompts: current.prompts.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                tags: value
                                  .split(',')
                                  .map((entry) => entry.trim())
                                  .filter(Boolean),
                              }
                            : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <LabeledTextarea
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
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Assets</span>
              <h2>Reference boards and deliverables</h2>
            </div>
            <button className="secondary" onClick={addAsset}>
              Add Asset
            </button>
          </div>
          <div className="stack-list">
            {project.assets.map((asset, index) => (
              <article className="stack-card" key={asset.id}>
                <div className="field-grid">
                  <LabeledInput
                    label="Asset label"
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
                  <LabeledInput
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
                  <LabeledInput
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
                  <LabeledInput
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
                <LabeledTextarea
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
              <span className="panel-kicker">Release Plan</span>
              <h2>Outputs and deliverables</h2>
            </div>
            <button className="secondary" onClick={addOutput}>
              Add Output
            </button>
          </div>
          <div className="stack-list">
            {project.outputs.map((output, index) => (
              <article className="stack-card" key={output.id}>
                <div className="stack-header">
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
                  <LabeledInput
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
                  <LabeledInput
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
                <LabeledInput
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

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type LabeledInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
}

function LabeledInput({ label, value, onChange, type = 'text' }: LabeledInputProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

type LabeledTextareaProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function LabeledTextarea({ label, value, onChange }: LabeledTextareaProps) {
  return (
    <label className="field field-textarea">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} />
    </label>
  )
}

export default App
