import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  onDelete: () => void;
  children: React.ReactNode;
}

const ANCHO_BOTON = 84;
const UMBRAL_APERTURA = -44;

export default function SwipeableRow({ onDelete, children }: Props) {
  const [translateX, setTranslateX] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const startX = useRef(0);
  const startedDrag = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    startedDrag.current = false;
    setArrastrando(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!arrastrando) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 6) startedDrag.current = true;
    setTranslateX(delta < 0 ? Math.max(delta, -ANCHO_BOTON) : 0);
  }

  function onPointerUp() {
    setArrastrando(false);
    setTranslateX((prev) => (prev < UMBRAL_APERTURA ? -ANCHO_BOTON : 0));
  }

  function onClickCapture(e: React.MouseEvent) {
    if (startedDrag.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-600"
        style={{ width: ANCHO_BOTON }}
      >
        <button
          type="button"
          onClick={() => {
            setTranslateX(0);
            onDelete();
          }}
          aria-label="Eliminar nota"
          className="flex h-full w-full items-center justify-center text-white"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: arrastrando ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
        className="relative bg-cream"
      >
        {children}
      </div>
    </div>
  );
}
