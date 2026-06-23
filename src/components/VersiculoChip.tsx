import { X } from 'lucide-react';

interface Props {
  referencia: string;
  onRemove: () => void;
}

export default function VersiculoChip({ referencia, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 py-2 pl-3.5 pr-2 text-sm font-medium text-sage-dark">
      {referencia}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${referencia}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-sage-dark/70 active:bg-sage/20"
      >
        <X size={15} />
      </button>
    </span>
  );
}
