import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import FAB from './FAB';

export default function Layout() {
  const location = useLocation();
  const esFormularioNota = location.pathname === '/nueva' || location.pathname.endsWith('/editar');
  const ocultarFAB = esFormularioNota || location.pathname === '/configuracion';

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-cream">
      <Header />
      <main className={`flex-1 overflow-y-auto ${esFormularioNota ? 'pb-4' : 'pb-28'}`}>
        <Outlet />
      </main>
      {!ocultarFAB && <FAB />}
      {!esFormularioNota && <BottomNav />}
    </div>
  );
}
