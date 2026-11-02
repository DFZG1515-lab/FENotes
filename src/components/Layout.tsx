import { useEffect } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const COLOR_VINO = '#7a1f2b';
const COLOR_FONDO = '#faf8f3';

export default function Layout() {
  const location = useLocation();
  const esEditor = location.pathname === '/nueva' || location.pathname.endsWith('/editar');
  const esDetalleNota = Boolean(useMatch('/nota/:id'));
  const enNotas = location.pathname === '/notas' || esDetalleNota;
  // En celular casi todas las pantallas abren con el bloque vino; solo estas dos no lo tienen.
  const sinBloque = location.pathname === '/versiculo' || location.pathname === '/configuracion';

  // La franja de la hora en iOS toma el theme-color: lo igualamos a lo que hay arriba de cada pantalla.
  const colorBarra = sinBloque ? COLOR_FONDO : COLOR_VINO;
  useEffect(() => {
    document.getElementById('meta-tema')?.setAttribute('content', colorBarra);
  }, [colorBarra]);

  // Las vistas de notas comparten un solo panel dividido: no reanimamos al cambiar de nota.
  const claveAnimacion = enNotas ? 'notas' : location.pathname;

  return (
    <div className="flex min-h-dvh bg-fondo lg:h-dvh lg:overflow-hidden lg:bg-paper">
      {!esEditor && <Sidebar />}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:h-dvh lg:min-h-0">
        <main
          className={`flex min-h-0 flex-1 flex-col ${
            esEditor || esDetalleNota ? '' : 'pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0'
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

        {!esEditor && !esDetalleNota && <BottomNav />}
      </div>
    </div>
  );
}
