import Logo from './Logo';

export default function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-sage">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream/15 text-cream">
        <Logo size={32} />
      </div>
      <h1 className="text-lg font-semibold tracking-tight text-cream">Daily Bread</h1>
    </div>
  );
}
