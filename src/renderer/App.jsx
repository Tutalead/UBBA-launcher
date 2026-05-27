import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n/i18n.js';
import TitleBar from './components/TitleBar.jsx';
import Frame from './components/Frame.jsx';
import Sidebar from './components/Sidebar.jsx';
import Backdrop from './components/Backdrop.jsx';
import RightRail from './components/RightRail.jsx';
import BottomBar from './components/BottomBar.jsx';
import LauncherUpdateBanner from './components/LauncherUpdateBanner.jsx';

import HomePage from './pages/HomePage.jsx';
import ChangelogPage from './pages/ChangelogPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const PAGES = {
  home: { label: 'HOME', component: HomePage },
  changelog: { label: 'CHANGELOG', component: ChangelogPage },
  settings: { label: 'SETTINGS', component: SettingsPage },
};

export default function App() {
  const [active, setActive] = useState('home');
  const [appVersion, setAppVersion] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    window.ubba?.app.getVersion().then(setAppVersion).catch(() => {});
    window.ubba?.settings.get().then((s) => {
      if (s?.language) i18n.changeLanguage(s.language);
    }).catch(() => {});
  }, []);

  const sidebarItems = Object.entries(PAGES).map(([key, v]) => ({
    key,
    label: t(`sidebar.${key}`, v.label),
  }));

  const Page = PAGES[active].component;

  return (
    <div className="h-full w-full flex flex-col" style={{background: 'radial-gradient(ellipse at 60% 40%, #2a1208 0%, #180c06 40%, #0b0a09 100%)'}}>
      <TitleBar />
      <div className="flex-1 min-h-0">
        <Frame>
          <LauncherUpdateBanner />

          <div className="flex flex-1 min-h-0">
            <Sidebar
              items={sidebarItems}
              active={active}
              onSelect={setActive}
            />

            <Backdrop>
              <div className="flex-1 min-h-0 px-6 pt-6 pb-4 overflow-y-auto">
                <Page />
              </div>
            </Backdrop>

            <RightRail appVersion={appVersion} />
          </div>

          <BottomBar />
        </Frame>
      </div>
    </div>
  );
}
