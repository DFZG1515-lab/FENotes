import { NavLink } from 'react-router-dom';
import { NotebookText, BookMarked, Settings } from 'lucide-react';

const items = [
  { to: '/', label: 'Notas', icon: NotebookText, end: true },
  { to: '/versiculos', label: 'Versículos', icon: BookMarked, end: false },
  { to: '/configuracion', label: 'Configuración', icon: Settings, end: false },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-line bg-cream/95 backdrop-blur">
      <ul className="flex">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs ${
                  isActive ? 'text-sage-dark' : 'text-bark-light'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  <span className={isActive ? 'font-medium' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
