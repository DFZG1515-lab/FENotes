import VersiculoMargen from './VersiculoMargen';

interface Props {
  referencia: string;
  onRemove: () => void;
  resaltado?: boolean;
}

export default function VersiculoChip({ referencia, onRemove, resaltado }: Props) {
  return <VersiculoMargen referencia={referencia} variante="chip" onRemove={onRemove} resaltado={resaltado} />;
}
