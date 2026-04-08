# Architecture

## Stack

- React 19
- Vite 8
- TypeScript
- localStorage for draft persistence
- JSON import/export for exchange
- manual PWA manifest + service worker

## Core modules

- `src/project-package.ts`
  - shared package schema for this repo
  - validation/parsing helpers
  - JSON export helpers
- `src/sample-project.ts`
  - known-good starter package
- `src/App.tsx`
  - editor UI and local draft workflow
- `public/manifest.webmanifest`
  - install metadata
- `public/sw.js`
  - lightweight service worker for installability

## Exchange format

The repo exports `creative-project-package-v1` packages with:

- `projectType: "music-video"`
- scenes tailored to music-video planning
- prompts, assets, outputs, and metrics reusable by adjacent tools

This makes it suitable for later interoperability with:

- `strudel-studio`
- `creative-canvas-editor`
- `canvas-planner-calculator`

## Storage strategy

V1 uses browser localStorage for draft state and JSON files for portability. A backend is intentionally deferred until the package structure is stable.
