import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Splash from './components/Splash';
import Devocional from './pages/Devocional';
import Inicio from './pages/Inicio';
import NuevaNota from './pages/NuevaNota';
import DetalleNota from './pages/DetalleNota';
import Versiculos from './pages/Versiculos';
import VersiculoDetalle from './pages/VersiculoDetalle';
import Configuracion from './pages/Configuracion';
import Asistente from './pages/Asistente';

const DURACION_SPLASH_MS = 900;
const DURACION_SALIDA_MS = 300;

function App() {
  const [fase, setFase] = useState<'splash' | 'saliendo' | 'app'>('splash');

  useEffect(() => {
    const t1 = setTimeout(() => setFase('saliendo'), DURACION_SPLASH_MS);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (fase !== 'saliendo') return;
    const t2 = setTimeout(() => setFase('app'), DURACION_SALIDA_MS);
    return () => clearTimeout(t2);
  }, [fase]);

  if (fase !== 'app') return <Splash saliendo={fase === 'saliendo'} />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Devocional />} />
        <Route element={<Layout />}>
          <Route path="/notas" element={<Inicio />} />
          <Route path="/nueva" element={<NuevaNota />} />
          <Route path="/nota/:id" element={<DetalleNota />} />
          <Route path="/nota/:id/editar" element={<NuevaNota />} />
          <Route path="/versiculos" element={<Versiculos />} />
          <Route path="/versiculo" element={<VersiculoDetalle />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/asistente" element={<Asistente />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
