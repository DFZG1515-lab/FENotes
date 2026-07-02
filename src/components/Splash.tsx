import { useEffect } from 'react';
import Logo from './Logo';

interface Props {
  saliendo?: boolean;
}

const SAGE = '#5b7a63';

export default function Splash({ saliendo = false }: Props) {
  useEffect(() => {
    document.documentElement.style.backgroundColor = SAGE;
    document.body.style.backgroundColor = SAGE;
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sage">
      <div
        className="flex flex-col items-center gap-3"
        style={{
          opacity: saliendo ? 0 : 1,
          transition: saliendo ? 'opacity 0.3s ease-in' : undefined,
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream/15 text-cream"
          style={{
            animation: !saliendo
              ? 'splash-logo-in 0.5s cubic-bezier(0.22,1,0.36,1) both, splash-pulse-ring 1.8s ease-out 0.5s infinite'
              : undefined,
          }}
        >
          <Logo size={32} />
        </div>

        <h1
          className="text-lg font-semibold tracking-tight text-cream"
          style={{ animation: !saliendo ? 'splash-text-in 0.5s ease-out 0.15s both' : undefined }}
        >
          Daily Bread
        </h1>

        <div className="mt-4 h-0.5 w-24 overflow-hidden rounded-full bg-cream/20">
          <div
            className="h-full rounded-full bg-cream/60"
            style={{ animation: !saliendo ? 'splash-bar 0.85s cubic-bezier(0.4,0,0.2,1) forwards' : undefined }}
          />
        </div>
      </div>
    </div>
  );
}
