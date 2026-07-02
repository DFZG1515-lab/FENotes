import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const esFormularioNota = location.pathname === '/nueva' || location.pathname.endsWith('/editar');

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-cream">
      <Header />
      <main className={`flex-1 overflow-y-auto ${esFormularioNota ? 'pb-4' : 'pb-28'}`}>
        <div key={location.pathname} style={{ animation: 'page-in 0.22s ease-out both' }}>
          <Outlet />
        </div>
      </main>
      {!esFormularioNota && <BottomNav />}
    </div>
  );
}
