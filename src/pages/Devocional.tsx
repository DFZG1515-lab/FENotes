import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { obtenerTextoCapitulo } from '../lib/bible';
import Logo from '../components/Logo';

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

const FONDO = '#14100d';

function diaDelAno(): number {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - inicio.getTime()) / 86400000);
}

function fechaDeHoy(): string {
  const texto = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

type Estado = 'cargando' | 'listo' | 'error';

export default function Devocional() {
  const versiculo = VERSICULOS[diaDelAno() % VERSICULOS.length];
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<Estado>('cargando');
  const [visible, setVisible] = useState(false);
  const [intento, setIntento] = useState(0);

  function reintentar() {
    setEstado('cargando');
    setVisible(false);
    setIntento((n) => n + 1);
  }

  useEffect(() => {
    document.documentElement.style.backgroundColor = FONDO;
    document.body.style.backgroundColor = FONDO;
    // La barra de estado de iOS toma este color; se regresa al papel al salir.
    const metaTema = document.getElementById('meta-tema');
    metaTema?.setAttribute('content', FONDO);
    return () => {
      metaTema?.setAttribute('content', '#f4efe4');
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    let activo = true;
    obtenerTextoCapitulo({
      libro: '',
      bookId: versiculo.bookId,
      capitulo: versiculo.capitulo,
      versoInicio: versiculo.versoInicio,
      versoFin: versiculo.versoFin,
    })
      .then((versos) => {
        if (!activo) return;
        setTexto(versos.map((v) => v.texto).join(' '));
        setEstado('listo');
        setTimeout(() => activo && setVisible(true), 50);
      })
      .catch(() => {
        if (!activo) return;
        setEstado('error');
        setTimeout(() => activo && setVisible(true), 50);
      });
    return () => {
      activo = false;
    };
  }, [intento, versiculo]);

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-7 lg:px-12"
      style={{
        backgroundColor: FONDO,
        color: '#f0e8d8',
        paddingTop: 'calc(40px + env(safe-area-inset-top))',
        paddingBottom: 'calc(44px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="candle-core" style={{ animation: 'candle-glow 5s ease-in-out infinite' }} />
      </div>
      <span aria-hidden className="ribbon absolute left-1/2 top-0 h-14 w-1.5 -translate-x-1/2 lg:h-32" />

      {/* Cabecera */}
      <div
        className="relative z-10 flex w-full flex-col items-center gap-2 pt-10 lg:flex-row lg:justify-between lg:pt-0"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}
      >
        <div className="flex items-center gap-2.5">
          <Logo size={18} liston="var(--color-gilt-light)" />
          <span className="hidden font-serif text-xl font-medium lg:inline">Daily Bread</span>
        </div>
        <span className="eyebrow" style={{ color: '#a89a86' }}>
          {fechaDeHoy()}
        </span>
      </div>

      {/* Versículo */}
      <div
        className="relative z-10 flex w-full max-w-[820px] flex-col items-center gap-6 py-8 text-center lg:gap-7"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
        }}
      >
        <span className="eyebrow text-gilt-light">Pan de hoy</span>

        {estado === 'cargando' && (
          <div className="flex flex-col items-center gap-3">
            <div style={{ animation: 'candle-flicker 1.5s ease-in-out infinite' }}>
              <div className="h-1 w-12 rounded-full" style={{ backgroundColor: '#3a2e20' }} />
            </div>
            <p className="text-sm" style={{ color: '#7a6a58' }}>
              Cargando versículo…
            </p>
          </div>
        )}

        {estado === 'listo' && (
          <>
            <p className="font-serif text-[28px] font-light italic leading-[1.35] lg:text-[44px] lg:leading-[1.32]">
              "{texto}"
            </p>
            <span className="eyebrow text-gilt-light lg:text-[15px]">
              {versiculo.ref} · Reina-Valera 1960
            </span>
          </>
        )}

        {estado === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm" style={{ color: '#8b7f70' }}>
              No se pudo cargar el versículo. Verifica tu conexión.
            </p>
            <button
              type="button"
              onClick={reintentar}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gilt-light"
              style={{ backgroundColor: '#2a2218', border: '1px solid #3a2e20' }}
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div
        className="relative z-10 flex w-full max-w-[420px] flex-col gap-2.5 lg:w-auto lg:max-w-none lg:flex-row lg:items-center lg:gap-3"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}
      >
        <Link
          to="/nueva"
          className="flex h-[50px] items-center justify-center gap-2 rounded-full bg-ribbon px-6 text-[15px] font-semibold text-white transition-colors hover:bg-ribbon-dark active:opacity-80 lg:order-2 lg:h-[46px] lg:text-sm"
        >
          <Plus size={15} strokeWidth={2.4} />
          Empezar a anotar
        </Link>
        <Link
          to="/notas"
          className="flex h-[50px] items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-opacity active:opacity-70 lg:order-1 lg:h-[46px] lg:text-sm"
          style={{ border: '1px solid rgba(240,232,216,0.22)', color: '#f0e8d8' }}
        >
          Mis notas
          <ChevronRight size={15} className="text-gilt-light" />
        </Link>
      </div>
    </div>
  );
}
