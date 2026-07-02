import { NavLink, useNavigate } from 'react-router-dom';
import { NotebookText, BookMarked, Plus } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-line bg-cream/95 backdrop-blur">
      <ul className="flex items-center">
        <li className="flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs ${
                isActive ? 'text-sage-dark' : 'text-bark-light'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <NotebookText size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span className={isActive ? 'font-medium' : ''}>Notas</span>
              </>
            )}
          </NavLink>
        </li>

        <li className="flex flex-1 justify-center pb-2">
          <button
            type="button"
            onClick={() => navigate('/nueva')}
            aria-label="Nueva nota"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-clay text-cream shadow-md shadow-black/20 transition-transform active:scale-90"
          >
            <Plus size={24} strokeWidth={2.4} />
          </button>
        </li>

        <li className="flex-1">
          <NavLink
            to="/versiculos"
            className={({ isActive }) =>
              `flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs ${
                isActive ? 'text-sage-dark' : 'text-bark-light'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <BookMarked size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span className={isActive ? 'font-medium' : ''}>Versículos</span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
