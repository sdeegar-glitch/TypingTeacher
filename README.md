# FastTypingLab

Free typing speed test and typing tutor, built for India — English & Hindi
(Mangal/INSCRIPT and Kruti Dev) typing practice, government exam prep (SSC,
CPCT, UPSSSC, UP Police and more), an AI tutor, and typing games.

**🌐 Website:** [fasttypinglab.com](https://fasttypinglab.com)

## 🖥️ Windows App

FastTypingLab is also available as a free native Windows app, built with
[Tauri](https://tauri.app). It bundles a set of typing tests so **practice
works fully offline** — no internet required.

**⬇️ [Download for Windows](https://fasttypinglab.com/download)**
(or grab the installer directly from [Releases](../../releases/latest))

> **Note on the SmartScreen warning:** the installer isn't yet signed with a
> paid code-signing certificate, so Windows may show a "Windows protected
> your PC" notice on first run. This is normal for new, independent apps —
> click **More info → Run anyway** to install. Since this repository is
> public, you're welcome to review the source before installing — see
> `frontend/src-tauri/` for the desktop app code and
> `.github/workflows/build-windows-app.yml` for exactly how the installer is
> built (via GitHub Actions, from this same source, with no manual steps).

## What's in this repo

- `frontend/` — React + Vite + TypeScript web app (also the source for the
  Windows app via Tauri)
- `backend/` — Node/Express API, Supabase-backed, AI-assisted test generation
- `frontend/src-tauri/` — Tauri desktop app configuration
- `.github/workflows/` — CI: web deploy (GitHub Pages) and the Windows app build

## Tech stack

React 19 · TypeScript · Tailwind CSS · Vite · Express · Supabase (Postgres + Auth) · Tauri

## License

All rights reserved. Source is public for transparency; this is not an
open-source-licensed project.
