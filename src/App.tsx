import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import NuevaNota from './pages/NuevaNota';
import DetalleNota from './pages/DetalleNota';
import Versiculos from './pages/Versiculos';
import VersiculoDetalle from './pages/VersiculoDetalle';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/nueva" element={<NuevaNota />} />
          <Route path="/nota/:id" element={<DetalleNota />} />
          <Route path="/nota/:id/editar" element={<NuevaNota />} />
          <Route path="/versiculos" element={<Versiculos />} />
          <Route path="/versiculo" element={<VersiculoDetalle />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
