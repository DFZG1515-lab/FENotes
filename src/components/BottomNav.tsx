import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookMarked, NotebookText, Plus, Sun } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Hoy', icon: Sun, activo: (p: string) => p === '/' },
  { to: '/notas', label: 'Notas', icon: NotebookText, activo: (p: string) => p === '/notas' || p.startsWith('/nota/') },
  { to: '/versiculos', label: 'Versículos', icon: BookMarked, activo: (p: string) => p.startsWith('/versiculo') },
];

/**
 * Barra inferior de celular: una cápsula blanca flotante donde la pestaña activa se vuelve
 * una píldora vino con su nombre, y a un lado el botón redondo para empezar una nota.
 */
export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-5 z-30 flex items-center gap-2.5 lg:hidden"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <ul className="flex h-[60px] flex-1 items-center justify-between rounded-full bg-white px-1.5 shadow-[0_6px_22px_rgba(70,30,25,0.12)]">
        {ITEMS.map(({ to, label, icon: Icon, activo }) => {
          const esActivo = activo(pathname);
          return (
            <li key={to}>
              <NavLink
                to={to}
                aria-label={esActivo ? undefined : label}
                aria-current={esActivo ? 'page' : undefined}
                className={`flex h-12 items-center justify-center gap-2 rounded-full transition-[background-color,padding] duration-200 ${
                  esActivo ? 'bg-vino px-[18px] text-[14px] font-semibold text-crema' : 'w-14 text-gris'
                }`}
              >
                <Icon size={esActivo ? 19 : 21} strokeWidth={1.7} />
                {esActivo && label}
              </NavLink>
            </li>
          );
        })}
      </ul>
      <Link
        to="/nueva"
        aria-label="Nueva nota"
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-vino text-crema shadow-[0_6px_18px_rgba(122,31,43,0.3)] active:opacity-90"
      >
        <Plus size={22} strokeWidth={2.2} />
      </Link>
    </nav>
  );
}
