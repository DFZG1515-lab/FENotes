import { useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, BookMarked, NotebookText, Plus, SlidersHorizontal } from 'lucide-react';
import Logo from './Logo';

const ITEMS = [
  { to: '/', label: 'Devocional de hoy', icon: BookOpen, activo: (p: string) => p === '/' },
  { to: '/notas', label: 'Notas', icon: NotebookText, activo: (p: string) => p === '/notas' || p.startsWith('/nota/') },
  { to: '/versiculos', label: 'Versículos', icon: BookMarked, activo: (p: string) => p.startsWith('/versiculo') },
];

const claseItem = (activo: boolean) =>
  `flex items-center gap-3 rounded-lg py-2.5 pl-6 pr-3 text-[15px] transition-colors ${
    activo ? 'bg-white/[0.06] font-semibold text-paper' : 'font-medium text-[#b7ab9a] hover:bg-white/[0.04] hover:text-paper'
  }`;

export default function Sidebar() {
  const { pathname } = useLocation();
  const asideRef = useRef<HTMLElement>(null);
  const [altoListon, setAltoListon] = useState(0);

  // El listón cuelga desde arriba hasta la sección activa, como el marcador de una Biblia.
  useLayoutEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;
    const activo = aside.querySelector<HTMLElement>('[data-activo="true"]');
    if (!activo) {
      setAltoListon(0);
      return;
    }
    const rectAside = aside.getBoundingClientRect();
    const rectActivo = activo.getBoundingClientRect();
    setAltoListon(rectActivo.bottom - rectAside.top - 6);
  }, [pathname]);

  return (
    <aside
      ref={asideRef}
      className="relative hidden h-dvh w-60 shrink-0 flex-col gap-1 bg-leather px-4 pb-6 pt-7 text-parchment lg:flex"
    >
      <span
        aria-hidden
        className="ribbon absolute left-5 top-0 w-1.5 transition-[height] duration-300 ease-out"
        style={{ height: altoListon, opacity: altoListon ? 1 : 0 }}
      />

      <div className="mb-7 flex items-center gap-3 pl-6">
        <Logo size={20} className="text-gilt-light" liston="var(--color-sage-light)" />
        <span className="font-serif text-[22px] font-medium tracking-tight text-paper">Daily Bread</span>
      </div>

      <NavLink
        to="/nueva"
        className="mx-1 mb-4 flex items-center justify-center gap-2 rounded-[10px] bg-ribbon py-3 text-[15px] font-semibold text-white shadow-sm shadow-black/30 transition-colors hover:bg-ribbon-dark"
      >
        <Plus size={16} strokeWidth={2.4} />
        Nueva nota
      </NavLink>

      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ to, label, icon: Icon, activo }) => {
          const esActivo = activo(pathname);
          return (
            <NavLink key={to} to={to} data-activo={esActivo} className={claseItem(esActivo)}>
              <Icon size={18} strokeWidth={esActivo ? 2.1 : 1.8} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-1" />

      <NavLink
        to="/configuracion"
        data-activo={pathname === '/configuracion'}
        className={claseItem(pathname === '/configuracion')}
      >
        <SlidersHorizontal size={18} strokeWidth={1.8} />
        Configuración
      </NavLink>
      <p className="mt-3 pl-6 text-xs leading-relaxed text-parchment-muted">
        Tus notas se guardan en este dispositivo y en tu respaldo de GitHub.
      </p>
    </aside>
  );
}
