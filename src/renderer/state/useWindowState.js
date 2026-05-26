import { useEffect, useState } from 'react';

export function useWindowState() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = window.ubba?.window;
    if (!api) return undefined;
    return api.onStateChange((s) => setIsMaximized(!!s.isMaximized));
  }, []);

  return {
    isMaximized,
    minimize: () => window.ubba?.window.minimize(),
    toggleMaximize: () => window.ubba?.window.toggleMaximize(),
    close: () => window.ubba?.window.close(),
  };
}
