import Button from './Button.jsx';
import { useWindowState } from '../state/useWindowState.js';

export default function BottomBar() {
  const { close } = useWindowState();
  return (
    <footer className="h-12 shrink-0 px-4 flex items-center justify-center border-t border-white/5" style={{background: 'linear-gradient(to top, rgba(20,8,3,0.80) 0%, rgba(20,8,3,0.40) 100%)'}}>
      <Button variant="ghost" size="sm" onClick={() => window.ubba.changelog.openUrl('https://discord.gg/jSnRR5ECQ')}>UBBA Discord Server</Button>
    </footer>
  );
}
