import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/** Botón flotante "Nueva nota", solo en celular. En escritorio vive en la barra lateral. */
export default function FAB() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/nueva')}
      aria-label="Nueva nota"
      className="fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ribbon text-white shadow-lg shadow-ink/25 transition-transform active:scale-95 lg:hidden"
      style={{ right: 'max(1.25rem, env(safe-area-inset-right))', bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <Plus size={26} strokeWidth={2.4} />
    </button>
  );
}
