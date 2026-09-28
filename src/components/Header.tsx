import { SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

/** Cabecera compacta solo para celular; en escritorio la marca vive en la barra lateral. */
export default function Header() {
  return (
    <header className="safe-top sticky top-0 z-20 bg-paper/95 px-5 pb-1 pt-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <Link to="/notas" className="flex items-center gap-2 text-ink">
          <Logo size={16} />
          <span className="font-serif text-[17px] font-medium">Daily Bread</span>
        </Link>
        <Link
          to="/configuracion"
          aria-label="Configuración"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted active:bg-cream-dark"
        >
          <SlidersHorizontal size={18} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
