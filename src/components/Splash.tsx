import { useEffect } from 'react';
import Logo from './Logo';

interface Props {
  saliendo?: boolean;
}

const SAGE = '#100e0a';

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: '#100e0a' }}>
      <div
        className="flex flex-col items-center gap-3"
        style={{
          opacity: saliendo ? 0 : 1,
          transition: saliendo ? 'opacity 0.3s ease-in' : undefined,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: 'rgba(250,246,240,0.12)',
            color: '#faf6f0',
            animation: !saliendo
              ? 'splash-logo-in 0.5s cubic-bezier(0.22,1,0.36,1) both, splash-pulse-ring 1.8s ease-out 0.5s infinite'
              : undefined,
          }}
        >
          <Logo size={32} />
        </div>

        <h1
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#faf6f0',
            animation: !saliendo ? 'splash-text-in 0.5s ease-out 0.15s both' : undefined,
          }}
        >
          Daily Bread
        </h1>

        <div style={{ marginTop: 16, height: 2, width: 96, overflow: 'hidden', borderRadius: 9999, backgroundColor: 'rgba(250,246,240,0.18)' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 9999,
              backgroundColor: 'rgba(250,246,240,0.55)',
              animation: !saliendo ? 'splash-bar 0.85s cubic-bezier(0.4,0,0.2,1) forwards' : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
