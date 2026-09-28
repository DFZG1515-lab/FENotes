import Logo from './Logo';

/** Estado del panel de lectura en escritorio cuando no hay nota elegida. */
export default function NotasVacio() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-paper text-gilt">
        <Logo size={26} />
      </div>
      <div>
        <p className="font-serif text-2xl font-medium text-ink">Elige una nota para leerla</p>
        <p className="mt-1.5 max-w-[320px] text-sm leading-relaxed text-ink-muted">
          Lo que anotaste aparece al centro y los versículos que mencionaste, al margen.
        </p>
      </div>
    </div>
  );
}
