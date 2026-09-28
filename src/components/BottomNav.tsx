import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, BookMarked, NotebookText } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Hoy', icon: BookOpen, activo: (p: string) => p === '/' },
  { to: '/notas', label: 'Notas', icon: NotebookText, activo: (p: string) => p === '/notas' || p.startsWith('/nota/') },
  { to: '/versiculos', label: 'Versículos', icon: BookMarked, activo: (p: string) => p.startsWith('/versiculo') },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-3 px-2 pt-1">
        {ITEMS.map(({ to, label, icon: Icon, activo }) => {
          const esActivo = activo(pathname);
          return (
            <li key={to} className="relative">
              {esActivo && <span aria-hidden className="ribbon absolute left-1/2 top-[-5px] h-4 w-[5px] -translate-x-1/2" />}
              <NavLink
                to={to}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 text-[11px] ${
                  esActivo ? 'font-semibold text-ink' : 'font-medium text-ink-muted'
                }`}
              >
                <Icon size={22} strokeWidth={esActivo ? 2.2 : 1.8} />
                <span>{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
