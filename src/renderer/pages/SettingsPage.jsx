import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n.js';
import Button from '../components/Button.jsx';

export default function SettingsPage() {
  const [modDir, setModDir] = useState('');
  const [gameExePath, setGameExePath] = useState('');
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    window.ubba?.settings.get().then((s) => {
      setModDir(s?.modDir || '');
      setGameExePath(s?.gameExePath || '');
      setLanguage(s?.language || 'en');
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
      language,
    });
    i18n.changeLanguage(language);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2 className="gothic uppercase tracking-widest text-bone-200 text-sm">{t('settings.title')}</h2>

      <div className="plate p-4 flex flex-col gap-4">
        {/* Language */}
        <div>
          <label className="gothic uppercase text-[11px] tracking-widest text-bone-400 block mb-1">
            {t('settings.language')}
          </label>
          <p className="text-[11px] text-bone-500 mb-2">{t('settings.languageDesc')}</p>
          <div className="flex gap-2">
            {[{ value: 'en', label: 'English' }, { value: 'ru', label: 'Русский' }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setLanguage(value); setSaved(false); }}
                className={`px-4 py-1.5 border gothic uppercase text-[11px] tracking-widest transition-colors ${
                  language === value
                    ? 'border-brass-400 bg-ink-800 text-brass-300'
                    : 'border-black/50 bg-ink-900/60 text-bone-400 hover:text-bone-200 hover:border-bone-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Mod install directory */}
        <div>
          <label className="gothic uppercase text-[11px] tracking-widest text-bone-400 block mb-1">
            {t('settings.modDir')}
          </label>
          <p className="text-[11px] text-bone-500 mb-2">{t('settings.modDirDesc')}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={modDir}
              onChange={(e) => { setModDir(e.target.value); setSaved(false); }}
              placeholder={t('settings.autoDetect')}
              className="flex-1 bg-ink-900 border border-white/10 rounded-sm px-3 py-1.5 text-bone-200 text-sm font-mono focus:outline-none focus:border-rust-button/60"
            />
            <Button variant="secondary" onClick={handleBrowseModDir} className="shrink-0 px-3 py-1.5 text-sm">
              {t('settings.browse')}
            </Button>
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Game executable */}
        <div>
          <label className="gothic uppercase text-[11px] tracking-widest text-bone-400 block mb-1">
            {t('settings.gameExe')}
          </label>
          <p className="text-[11px] text-bone-500 mb-2">{t('settings.gameExeDesc')}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={gameExePath}
              onChange={(e) => { setGameExePath(e.target.value); setSaved(false); }}
              placeholder={t('settings.autoDetect')}
              className="flex-1 bg-ink-900 border border-white/10 rounded-sm px-3 py-1.5 text-bone-200 text-sm font-mono focus:outline-none focus:border-rust-button/60"
            />
            <Button variant="secondary" onClick={handleBrowseExe} className="shrink-0 px-3 py-1.5 text-sm">
              {t('settings.browse')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} className="px-5 py-1.5 text-sm">
          {t('settings.save')}
        </Button>
        {saved && (
          <span className="gothic uppercase text-[11px] tracking-widest text-bone-400">
            {t('settings.saved')}
          </span>
        )}
      </div>
    </div>
  );
}
