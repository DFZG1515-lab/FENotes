import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FAB() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/nueva')}
      aria-label="Nueva nota"
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-clay text-cream shadow-lg shadow-black/20 transition-transform active:scale-95"
      style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <Plus size={28} strokeWidth={2.4} />
    </button>
  );
}
