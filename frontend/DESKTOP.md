# FastTypingLab — Windows Desktop App (Tauri)

The desktop app wraps the existing web frontend in a native Windows executable
using [Tauri](https://tauri.app). It ships with a bundle of typing tests so
**practice works fully offline** (see `src/data/offlineTests.json`). Account
features, the AI tutor, certificates and *new* test generation still need the
internet — only bundled practice works offline.

## One-time toolchain setup (required to build the .exe)

The `.exe` is compiled by Rust, so you install these **once** on the build machine:

1. **Rust** — install via rustup: https://www.rust-lang.org/tools/install
   (or `winget install Rustlang.Rustup`). Restart the terminal after installing.
2. **Microsoft C++ Build Tools** (the MSVC linker) —
   `winget install Microsoft.VisualStudio.2022.BuildTools`
   then, in the Visual Studio Installer, tick **"Desktop development with C++"**.
3. **WebView2 runtime** — already present on Windows 10/11 in almost all cases;
   if not: https://developer.microsoft.com/microsoft-edge/webview2/

Verify: `cargo --version` and `rustc --version` should both print a version.

## Develop (hot-reload desktop window)

```bash
cd frontend
npm run app:dev
```

This starts Vite and opens the app in a native window with live reload.

## Build the installer

```bash
cd frontend
npm run app:build
```

The installer(s) are written to:

```
frontend/src-tauri/target/release/bundle/
  ├─ msi/FastTypingLab_1.0.0_x64_en-US.msi
  └─ nsis/FastTypingLab_1.0.0_x64-setup.exe
```

Distribute the `.exe` (NSIS) or `.msi` from a `/download` page on the site.

## Notes

- **Code signing:** unsigned installers trigger a Windows SmartScreen
  "unknown publisher" warning. For public distribution, buy a code-signing
  certificate and configure it in `tauri.conf.json` → `bundle.windows`.
- **Refreshing offline tests:** re-run the snapshot to pull newer passages
  from the live backend into `src/data/offlineTests.json`, then rebuild.
- **App config:** window size, title and identifier live in
  `src-tauri/tauri.conf.json`.
