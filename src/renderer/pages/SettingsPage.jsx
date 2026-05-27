import { useState, useEffect } from 'react';
import Button from '../components/Button.jsx';

export default function SettingsPage() {
  const [modDir, setModDir] = useState('');
  const [gameExePath, setGameExePath] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.ubba?.settings.get().then((s) => {
      setModDir(s?.modDir || '');
      setGameExePath(s?.gameExePath || '');
      setLoading(false);
    });
  }, []);

  async function handleBrowseModDir() {
    const dir = await window.ubba?.settings.browseDir('dir');
    if (dir) { setModDir(dir); setSaved(false); }
  }

  async function handleBrowseExe() {
    const file = await window.ubba?.settings.browseDir('file');
    if (file) { setGameExePath(file); setSaved(false); }
  }

  async function handleSave() {
    await window.ubba?.settings.set({
      modDir: modDir || null,
      gameExePath: gameExePath || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2 className="gothic uppercase tracking-widest text-bone-200 text-sm">Settings</h2>

      <div className="plate p-4 flex flex-col gap-4">
        {/* Mod install directory */}
        <div>
          <label className="gothic uppercase text-[11px] tracking-widest text-bone-400 block mb-1">
            Mod Install Directory
          </label>
          <p className="text-[11px] text-bone-500 mb-2">
            Folder where mod files (UBBA, addon_data, etc.) will be installed.
            Leave empty to auto-detect from the launcher location.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={modDir}
              onChange={(e) => { setModDir(e.target.value); setSaved(false); }}
              placeholder="Auto-detect"
              className="flex-1 bg-ink-900 border border-white/10 rounded-sm px-3 py-1.5 text-bone-200 text-sm font-mono focus:outline-none focus:border-rust-button/60"
            />
            <Button variant="secondary" onClick={handleBrowseModDir} className="shrink-0 px-3 py-1.5 text-sm">
              Browse…
            </Button>
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Game executable */}
        <div>
          <label className="gothic uppercase text-[11px] tracking-widest text-bone-400 block mb-1">
            Game Executable (W40k.exe)
          </label>
          <p className="text-[11px] text-bone-500 mb-2">
            Full path to the game executable used to launch the game.
            Leave empty to auto-detect from the launcher location.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={gameExePath}
              onChange={(e) => { setGameExePath(e.target.value); setSaved(false); }}
              placeholder="Auto-detect"
              className="flex-1 bg-ink-900 border border-white/10 rounded-sm px-3 py-1.5 text-bone-200 text-sm font-mono focus:outline-none focus:border-rust-button/60"
            />
            <Button variant="secondary" onClick={handleBrowseExe} className="shrink-0 px-3 py-1.5 text-sm">
              Browse…
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} className="px-5 py-1.5 text-sm">
          Save
        </Button>
        {saved && (
          <span className="gothic uppercase text-[11px] tracking-widest text-bone-400">
            Saved ✓
          </span>
        )}
      </div>
    </div>
  );
}
