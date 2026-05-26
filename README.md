# UBBA Launcher

Electron desktop launcher for UBBA. Renderer is **React + Tailwind** built with Vite; main process handles **self-update** via `electron-updater`.

## Stack

- **Electron** main process (hardened: contextIsolation, sandbox, strict CSP)
- **React 18 + Tailwind 3** renderer, bundled by **Vite**
- **electron-updater** for launcher self-update (generic HTTP feed)
- **electron-log** for logging

## Project layout

```
src/
  main/
    index.js                  # App entry, window, IPC. Loads Vite URL in dev,
                              # built file in prod.
    updater/
      launcher-updater.js     # electron-updater wrapper (self-update)
  preload/
    index.js                  # contextBridge -> window.ubba
  renderer/                   # Vite root
    index.html
    main.jsx
    App.jsx
    index.css                 # Tailwind directives
    components/               # Frame, Sidebar, Panel, Button, ...
    pages/                    # HomePage, SettingsPage, AddonsPage, NewsPage
    state/                    # React hooks (useLauncherUpdate)
  shared/
    config.js                 # Env-overridable config
    ipc-channels.js           # Channel name constants
    logger.js                 # electron-log setup
vite.config.js
tailwind.config.js
postcss.config.js
```

## Component tree

```
<App>
  <Frame>
    <LauncherUpdateBanner />       (only when updater has news)
    <Sidebar items=... />          (HOME / GAME SETTINGS / ADDONS / NEWS)
    <main>
      <TopBanner />                ("UBBA" title — replace with art later)
      <Page>                       (HomePage | SettingsPage | AddonsPage | NewsPage)
        <ActionColumn />           (PLAY GAME, QUICK JOIN, UPDATE ADDON)
        <Panel toggleable>
          <Checkbox /> <Select /> <ToggleSwitch /> <Button />
        </Panel>
      </Page>
    </main>
    <RightRail />                  (vertical news)
    <BottomBar />                  (Credits / Exit / Community)
  </Frame>
```

All gameplay/addon controls are visual placeholders for now — only the launcher self-update path is wired end-to-end.

## Run

```powershell
npm install
npm run dev
```

`npm run dev` launches the Vite dev server and Electron in parallel via `concurrently`. Electron waits for `http://localhost:5173` before opening and loads from it (HMR enabled). DevTools open automatically in dev.

## Build

```powershell
npm run build:win
```

Vite first emits the renderer to `dist-renderer/`, then `electron-builder` packages installers into `dist/`.

## Self-update

Configured in `package.json` → `build.publish` (generic provider). Push the `dist/` output (including `latest.yml` / `latest-mac.yml` / `latest-linux.yml`) to your update bucket; the launcher checks on startup and every 30 minutes in production builds.

Env overrides (see [src/shared/config.js](src/shared/config.js)):

| Variable                  | Purpose                            |
| ------------------------- | ---------------------------------- |
| `UBBA_LAUNCHER_FEED`      | Generic feed base URL              |
| `UBBA_LAUNCHER_CHANNEL`   | `latest` / `beta` / ...            |
