import { useEffect } from 'react';
import Logo from './Logo';

interface Props {
  saliendo?: boolean;
}

const FONDO = '#14100d';

export default function Splash({ saliendo = false }: Props) {
  useEffect(() => {
    document.documentElement.style.backgroundColor = FONDO;
    document.body.style.backgroundColor = FONDO;
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: FONDO }}>
      <span
        aria-hidden
        className="ribbon absolute left-1/2 top-0 w-1.5 -translate-x-1/2"
        style={{ height: 88, animation: !saliendo ? 'splash-bar 0.6s ease-out both' : undefined, transformOrigin: 'top' }}
      />
      <div
        className="flex flex-col items-center gap-3"
        style={{
          opacity: saliendo ? 0 : 1,
          transition: saliendo ? 'opacity 0.3s ease-in' : undefined,
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-paper"
          style={{
            backgroundColor: 'rgba(244,239,228,0.10)',
            animation: !saliendo ? 'splash-logo-in 0.5s cubic-bezier(0.22,1,0.36,1) both' : undefined,
          }}
        >
          <Logo size={30} className="text-gilt-light" liston="var(--color-sage-light)" />
        </div>

        <h1
          className="font-serif text-2xl font-medium tracking-tight text-paper"
          style={{ animation: !saliendo ? 'splash-text-in 0.5s ease-out 0.15s both' : undefined }}
        >
          Daily Bread
        </h1>

        <div className="mt-4 h-0.5 w-24 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(244,239,228,0.15)' }}>
          <div
            className="h-full rounded-full bg-gilt-light"
            style={{ animation: !saliendo ? 'splash-bar 0.85s cubic-bezier(0.4,0,0.2,1) forwards' : undefined }}
          />
        </div>
      </div>
    </div>
  );
}
