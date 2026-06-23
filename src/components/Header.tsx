import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-line bg-cream/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-cream">
            <Logo size={18} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-bark">Daily Bread</h1>
        </div>
        <Link
          to="/configuracion"
          aria-label="Configuración"
          className="flex h-9 w-9 items-center justify-center text-bark-light active:text-bark"
        >
          <Settings size={19} />
        </Link>
      </div>
    </header>
  );
}
