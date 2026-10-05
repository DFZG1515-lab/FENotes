import { useEffect, useState } from 'react';

declare const __VERSION__: string;

// TEMPORAL: mide el viewport en el iPhone para encontrar por qué la barra inferior queda alta.
export default function Diagnostico() {
  const [datos, setDatos] = useState<Record<string, string | number | boolean>>({});
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const medir = () => {
      const probe = document.createElement('div');
      probe.style.cssText =
        'position:fixed;top:0;left:0;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const dvh = document.createElement('div');
      dvh.style.cssText = 'position:fixed;top:0;visibility:hidden;height:100dvh';
      const vh = document.createElement('div');
      vh.style.cssText = 'position:fixed;top:0;visibility:hidden;height:100vh';
      document.body.append(dvh, vh);
      setDatos({
        version: __VERSION__,
        standalone: Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
        displayMode: matchMedia('(display-mode: standalone)').matches,
        screenH: screen.height,
        innerH: window.innerHeight,
        clientH: document.documentElement.clientHeight,
        vvH: Math.round(window.visualViewport?.height ?? 0),
        vvTop: Math.round(window.visualViewport?.offsetTop ?? 0),
        dvh: dvh.offsetHeight,
        vh: vh.offsetHeight,
        safeTop: cs.paddingTop,
        safeBottom: cs.paddingBottom,
        scrollH: document.documentElement.scrollHeight,
        sw: Boolean(navigator.serviceWorker?.controller),
      });
      probe.remove();
      dvh.remove();
      vh.remove();
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] h-[3px] bg-red-600" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 z-[60] h-[3px] bg-blue-600"
        style={{ bottom: 'env(safe-area-inset-bottom)' }}
      />
      {visible && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="fixed left-2 top-24 z-[60] rounded-lg bg-black/80 p-2 text-left font-mono text-[11px] leading-tight text-white"
        >
          {Object.entries(datos).map(([k, v]) => (
            <div key={k}>
              {k}: {String(v)}
            </div>
          ))}
          <div className="mt-1 text-white/60">toca para ocultar</div>
        </button>
      )}
    </>
  );
}
