import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, RefreshCw } from 'lucide-react';
import { obtenerTextoCapitulo } from '../lib/bible';

interface VersiculoCurado {
  ref: string;
  bookId: number;
  capitulo: number;
  versoInicio: number;
  versoFin: number;
}

const VERSICULOS: VersiculoCurado[] = [
  { ref: 'Juan 3:16', bookId: 43, capitulo: 3, versoInicio: 16, versoFin: 16 },
  { ref: 'Salmos 23:1-3', bookId: 19, capitulo: 23, versoInicio: 1, versoFin: 3 },
  { ref: 'Proverbios 3:5-6', bookId: 20, capitulo: 3, versoInicio: 5, versoFin: 6 },
  { ref: 'Filipenses 4:13', bookId: 50, capitulo: 4, versoInicio: 13, versoFin: 13 },
  { ref: 'Romanos 8:28', bookId: 45, capitulo: 8, versoInicio: 28, versoFin: 28 },
  { ref: 'Isaías 40:31', bookId: 23, capitulo: 40, versoInicio: 31, versoFin: 31 },
  { ref: 'Jeremías 29:11', bookId: 24, capitulo: 29, versoInicio: 11, versoFin: 11 },
  { ref: 'Josué 1:9', bookId: 6, capitulo: 1, versoInicio: 9, versoFin: 9 },
  { ref: 'Mateo 11:28', bookId: 40, capitulo: 11, versoInicio: 28, versoFin: 28 },
  { ref: 'Salmos 46:1', bookId: 19, capitulo: 46, versoInicio: 1, versoFin: 1 },
  { ref: 'Romanos 8:38-39', bookId: 45, capitulo: 8, versoInicio: 38, versoFin: 39 },
  { ref: 'Filipenses 4:6-7', bookId: 50, capitulo: 4, versoInicio: 6, versoFin: 7 },
  { ref: 'Mateo 6:33', bookId: 40, capitulo: 6, versoInicio: 33, versoFin: 33 },
  { ref: 'Salmos 119:105', bookId: 19, capitulo: 119, versoInicio: 105, versoFin: 105 },
  { ref: 'Isaías 41:10', bookId: 23, capitulo: 41, versoInicio: 10, versoFin: 10 },
  { ref: 'Juan 14:6', bookId: 43, capitulo: 14, versoInicio: 6, versoFin: 6 },
  { ref: 'Efesios 2:8-9', bookId: 49, capitulo: 2, versoInicio: 8, versoFin: 9 },
  { ref: '2 Timoteo 3:16-17', bookId: 55, capitulo: 3, versoInicio: 16, versoFin: 17 },
  { ref: 'Gálatas 5:22-23', bookId: 48, capitulo: 5, versoInicio: 22, versoFin: 23 },
  { ref: 'Salmos 27:1', bookId: 19, capitulo: 27, versoInicio: 1, versoFin: 1 },
  { ref: 'Mateo 5:3-5', bookId: 40, capitulo: 5, versoInicio: 3, versoFin: 5 },
  { ref: 'Juan 1:1-3', bookId: 43, capitulo: 1, versoInicio: 1, versoFin: 3 },
  { ref: 'Hebreos 11:1', bookId: 58, capitulo: 11, versoInicio: 1, versoFin: 1 },
  { ref: '1 Corintios 13:4-5', bookId: 46, capitulo: 13, versoInicio: 4, versoFin: 5 },
  { ref: 'Santiago 1:2-3', bookId: 59, capitulo: 1, versoInicio: 2, versoFin: 3 },
  { ref: 'Romanos 12:1-2', bookId: 45, capitulo: 12, versoInicio: 1, versoFin: 2 },
  { ref: 'Salmos 37:4', bookId: 19, capitulo: 37, versoInicio: 4, versoFin: 4 },
  { ref: 'Colosenses 3:23', bookId: 51, capitulo: 3, versoInicio: 23, versoFin: 23 },
  { ref: '1 Juan 4:19', bookId: 62, capitulo: 4, versoInicio: 19, versoFin: 19 },
  { ref: 'Efesios 6:10-11', bookId: 49, capitulo: 6, versoInicio: 10, versoFin: 11 },
  { ref: 'Mateo 28:19-20', bookId: 40, capitulo: 28, versoInicio: 19, versoFin: 20 },
  { ref: 'Salmos 1:1-2', bookId: 19, capitulo: 1, versoInicio: 1, versoFin: 2 },
  { ref: 'Juan 10:10', bookId: 43, capitulo: 10, versoInicio: 10, versoFin: 10 },
  { ref: 'Proverbios 22:6', bookId: 20, capitulo: 22, versoInicio: 6, versoFin: 6 },
  { ref: 'Salmos 34:18', bookId: 19, capitulo: 34, versoInicio: 18, versoFin: 18 },
  { ref: '2 Corintios 5:17', bookId: 47, capitulo: 5, versoInicio: 17, versoFin: 17 },
  { ref: 'Romanos 5:8', bookId: 45, capitulo: 5, versoInicio: 8, versoFin: 8 },
  { ref: 'Juan 15:5', bookId: 43, capitulo: 15, versoInicio: 5, versoFin: 5 },
  { ref: 'Hebreos 12:1-2', bookId: 58, capitulo: 12, versoInicio: 1, versoFin: 2 },
  { ref: 'Apocalipsis 3:20', bookId: 66, capitulo: 3, versoInicio: 20, versoFin: 20 },
];

function diaDelAno(): number {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - inicio.getTime()) / 86400000);
}

type Estado = 'cargando' | 'listo' | 'error';

export default function Devocional() {
  const navigate = useNavigate();
  const versiculo = VERSICULOS[diaDelAno() % VERSICULOS.length];
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<Estado>('cargando');
  const [visible, setVisible] = useState(false);
  const intentoRef = useRef(0);

  async function cargarVerso() {
    const intento = ++intentoRef.current;
    setEstado('cargando');
    setVisible(false);
    try {
      const versos = await obtenerTextoCapitulo({
        libro: '',
        bookId: versiculo.bookId,
        capitulo: versiculo.capitulo,
        versoInicio: versiculo.versoInicio,
        versoFin: versiculo.versoFin,
      });
      if (intento !== intentoRef.current) return;
      setTexto(versos.map((v) => v.texto).join(' '));
      setEstado('listo');
      setTimeout(() => setVisible(true), 50);
    } catch {
      if (intento !== intentoRef.current) return;
      setEstado('error');
      setTimeout(() => setVisible(true), 50);
    }
  }

  useEffect(() => {
    cargarVerso();
  }, []);

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden"
      style={{ backgroundColor: '#100e0a', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Candle glow layer */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div style={{ animation: 'candle-glow 4s ease-in-out infinite' }} className="candle-core" />
        <div style={{ animation: 'candle-glow 4s ease-in-out infinite 0.8s' }} className="candle-ring" />
      </div>

      {/* Header */}
      <div
        className="relative z-10 flex w-full flex-col items-center pt-10"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}
      >
        <BookOpen size={20} color="#c98a5e" strokeWidth={1.8} />
        <p className="mt-2 text-xs tracking-[0.2em] uppercase" style={{ color: '#9a8070' }}>
          Daily Bread
        </p>
      </div>

      {/* Verse content */}
      <div
        className="relative z-10 flex w-full max-w-[360px] flex-col items-center px-8 py-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
        }}
      >
        {estado === 'cargando' && (
          <div className="flex flex-col items-center gap-3">
            <div style={{ animation: 'candle-flicker 1.5s ease-in-out infinite' }}>
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: '#3a2e20' }} />
            </div>
            <p className="text-sm" style={{ color: '#5a4a38' }}>Cargando versículo...</p>
          </div>
        )}

        {estado === 'listo' && (
          <>
            <p
              className="text-center text-xl font-light leading-relaxed"
              style={{ color: '#f0e8d8', fontStyle: 'italic', letterSpacing: '0.01em' }}
            >
              "{texto}"
            </p>
            <p
              className="mt-5 text-sm font-medium tracking-wider"
              style={{ color: '#c98a5e' }}
            >
              — {versiculo.ref}
            </p>
          </>
        )}

        {estado === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm" style={{ color: '#6b5a48' }}>
              No se pudo cargar el versículo.{'\n'}Verifica tu conexión.
            </p>
            <button
              type="button"
              onClick={cargarVerso}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
              style={{ backgroundColor: '#2a2218', color: '#c98a5e', border: '1px solid #3a2e20' }}
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Bottom — go to notes */}
      <div
        className="relative z-10 flex w-full flex-col items-center pb-10"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 1s ease 0.5s',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/notas')}
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity active:opacity-70"
          style={{ backgroundColor: '#1e1810', color: '#a89070', border: '1px solid #2e261a' }}
        >
          Mis notas
          <ChevronRight size={16} style={{ color: '#c98a5e' }} />
        </button>
      </div>
    </div>
  );
}
