import { Outlet, useLocation, useMatch } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import FAB from './FAB';

export default function Layout() {
  const location = useLocation();
  const esEditor = location.pathname === '/nueva' || location.pathname.endsWith('/editar');
  const esDetalleNota = Boolean(useMatch('/nota/:id'));
  const esDetalleVersiculo = location.pathname === '/versiculo';
  const enNotas = location.pathname === '/notas' || esDetalleNota;

  // Las vistas de notas comparten un solo panel dividido: no reanimamos al cambiar de nota.
  const claveAnimacion = enNotas ? 'notas' : location.pathname;

  return (
    <div className="flex min-h-dvh bg-paper lg:h-dvh lg:overflow-hidden">
      {!esEditor && <Sidebar />}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:h-dvh lg:min-h-0">
        {!esEditor && !esDetalleNota && !esDetalleVersiculo && <Header />}

        <main
          className={`flex min-h-0 flex-1 flex-col ${
            esEditor ? '' : 'pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0'
          } lg:overflow-hidden`}
        >
          <div
            key={claveAnimacion}
            className="flex min-h-0 flex-1 flex-col"
            style={{ animation: 'page-in 0.22s ease-out both' }}
          >
            <Outlet />
          </div>
        </main>

        {!esEditor && (location.pathname === '/notas' || location.pathname === '/versiculos') && <FAB />}
        {!esEditor && !esDetalleNota && <BottomNav />}
      </div>
    </div>
  );
}
