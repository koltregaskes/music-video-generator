# Music Video Generator

Music Video Generator turns a song, lyric sheet, or creative brief into a structured `creative-project-package-v1` production package.

## What it does

- captures song metadata and creative direction
- builds scene lists with timing, shot counts, and visual notes
- stores prompt packs and reference assets
- exports and imports `creative-project-package-v1` JSON files
- installs as a lightweight PWA on desktop and Android

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://127.0.0.1:4301`.

For Windows, you can also use:

```bat
start.cmd
```

## JSON contract

This repo uses `creative-project-package-v1` with `projectType: "music-video"`.

Top-level fields:

- `projectType`
- `title`
- `slug`
- `summary`
- `status`
- `createdAt`
- `updatedAt`
- `inputs`
- `scenes`
- `assets`
- `prompts`
- `outputs`
- `metrics`
- `notes`

## Included baseline

- React + Vite + TypeScript
- manual PWA support
- sample project data
- local JSON import/export
- docs for setup and architecture

## Scope for v1

Included:

- song metadata input
- lyrics/theme input
- scene list builder
- shot prompt pack
- style references
- edit/timing plan
- export/import support

Not included yet:

- direct model execution
- automated render orchestration
- native Android wrapper
