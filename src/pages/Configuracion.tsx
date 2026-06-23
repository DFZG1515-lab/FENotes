import { useRef, useState } from 'react';
import { Download, Upload, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { exportarJSON, getConfiguracion, getTotalNotas, importarJSON, saveConfiguracion } from '../lib/storage';

export default function Configuracion() {
  const [apiKey, setApiKey] = useState(() => getConfiguracion().apiKey);
  const [mostrarKey, setMostrarKey] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const total = getTotalNotas();

  function guardarApiKey() {
    saveConfiguracion({ apiKey: apiKey.trim() });
    setMensaje({ tipo: 'ok', texto: 'API key guardada en este navegador.' });
  }

  function exportar() {
    const json = exportarJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-bread-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importarJSON(String(reader.result));
        setMensaje({ tipo: 'ok', texto: 'Notas importadas correctamente. Vuelve al inicio para verlas.' });
      } catch {
        setMensaje({ tipo: 'error', texto: 'El archivo no es un respaldo válido de Daily Bread.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="px-4 pt-4">
      <h2 className="mb-1 text-xl font-semibold text-bark">Configuración</h2>
      <p className="mb-5 text-sm text-bark-light">{total} notas guardadas en este dispositivo.</p>

      <section className="mb-6 rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-1 text-sm font-semibold text-bark">API key de Groq</h3>
        <p className="mb-3 flex items-start gap-1.5 text-xs leading-relaxed text-bark-light">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-sage" />
          Tu API key se guarda solo en este navegador (localStorage) y se usa únicamente para llamar a la API de
          Groq desde tu dispositivo. Nunca se envía a ningún otro servidor. Consíguela gratis en
          console.groq.com/keys.
        </p>
        <div className="relative">
          <input
            type={mostrarKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-12 text-base text-bark focus:border-sage focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMostrarKey((v) => !v)}
            aria-label={mostrarKey ? 'Ocultar API key' : 'Mostrar API key'}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-bark-light"
          >
            {mostrarKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={guardarApiKey}
          className="mt-3 w-full rounded-xl bg-sage py-3 text-sm font-semibold text-cream active:bg-sage-dark"
        >
          Guardar API key
        </button>
      </section>

      {mensaje && (
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-sm ${
            mensaje.tipo === 'ok' ? 'bg-sage/10 text-sage-dark' : 'bg-red-50 text-red-700'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <section className="rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-1 text-sm font-semibold text-bark">Respaldo de notas</h3>
        <p className="mb-3 text-xs leading-relaxed text-bark-light">
          Exporta tus notas a un archivo JSON para resguardarlas o llevarlas a otro dispositivo, o impórtalas de
          vuelta.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={exportar}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium text-bark active:bg-cream-dark/40"
          >
            <Download size={18} />
            Exportar a JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium text-bark active:bg-cream-dark/40"
          >
            <Upload size={18} />
            Importar desde JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={importar} className="hidden" />
        </div>
      </section>
    </div>
  );
}
