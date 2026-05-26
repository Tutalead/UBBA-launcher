import Button from './Button.jsx';
import { useWindowState } from '../state/useWindowState.js';

export default function BottomBar() {
  const { close } = useWindowState();
  return (
    <footer className="h-12 shrink-0 px-4 flex items-center justify-between border-t border-black/70 bg-ink-800/80">
      <Button variant="ghost" size="sm">Credits</Button>
      <Button variant="ghost" size="sm">UBBA Discord Server</Button>
    </footer>
  );
}
