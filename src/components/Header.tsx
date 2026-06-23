import { BookOpenText } from 'lucide-react';

export default function Header() {
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-line bg-cream/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-cream">
          <BookOpenText size={20} strokeWidth={2.2} />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-bark">FeNotes</h1>
      </div>
    </header>
  );
}
