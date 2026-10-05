import { NavLink, useLocation } from 'react-router-dom';
import { BookMarked, House } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Inicio', icon: House, activo: (p: string) => p === '/' || p === '/notas' || p.startsWith('/nota/') },
  { to: '/versiculos', label: 'Versículos', icon: BookMarked, activo: (p: string) => p.startsWith('/versiculo') },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-3 z-30 rounded-[22px] border border-line bg-page/95 px-1.5 py-1.5 shadow-lg shadow-ink/10 backdrop-blur lg:hidden"
      style={{ bottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
    >
      <ul className="grid grid-cols-2 gap-1">
        {ITEMS.map(({ to, label, icon: Icon, activo }) => {
          const esActivo = activo(pathname);
          return (
            <li key={to} className="relative">
              {esActivo && <span aria-hidden className="ribbon absolute left-1/2 top-[-7px] z-10 h-4 w-[5px] -translate-x-1/2" />}
              <NavLink
                to={to}
                className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] ${
                  esActivo ? 'bg-paper font-semibold text-ink' : 'font-medium text-ink-muted'
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
