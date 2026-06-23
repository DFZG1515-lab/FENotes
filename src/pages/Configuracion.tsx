import { useRef, useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  CloudDownload,
  ChevronDown,
  Info,
} from 'lucide-react';
import { exportarJSON, getConfiguracion, getNotas, getTotalNotas, importarJSON, saveConfiguracion } from '../lib/storage';
import { WidgetSyncError, restaurarBackupDesdeGitHub, sincronizarWidget } from '../lib/widgetSync';

export default function Configuracion() {
  const [apiKey, setApiKey] = useState(() => getConfiguracion().apiKey);
  const [mostrarKey, setMostrarKey] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => getConfiguracion().geminiApiKey ?? '');
  const [mostrarGeminiKey, setMostrarGeminiKey] = useState(false);
  const [githubToken, setGithubToken] = useState(() => getConfiguracion().githubToken ?? '');
  const [mostrarToken, setMostrarToken] = useState(false);
  const [rawUrl, setRawUrl] = useState('');
  const [sincronizando, setSincronizando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [acercaDeAbierto, setAcercaDeAbierto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const total = getTotalNotas();

  function guardarApiKey() {
    saveConfiguracion({ ...getConfiguracion(), apiKey: apiKey.trim() });
    setMensaje({ tipo: 'ok', texto: 'API key guardada en este navegador.' });
  }

  function guardarGeminiApiKey() {
    saveConfiguracion({ ...getConfiguracion(), geminiApiKey: geminiApiKey.trim() });
    setMensaje({ tipo: 'ok', texto: 'API key de respaldo guardada.' });
  }

  function guardarGithubToken() {
    saveConfiguracion({ ...getConfiguracion(), githubToken: githubToken.trim() });
    setMensaje({ tipo: 'ok', texto: 'Token de GitHub guardado.' });
  }

  async function sincronizarAhora() {
    const ultima = getNotas()[0];
    if (!ultima) {
      setMensaje({ tipo: 'error', texto: 'Aún no tienes ninguna nota guardada para sincronizar.' });
      return;
    }
    setSincronizando(true);
    setMensaje(null);
    try {
      const url = await sincronizarWidget(ultima);
      if (!url) {
        setMensaje({ tipo: 'error', texto: 'Primero guarda tu token de GitHub arriba.' });
        return;
      }
      setRawUrl(url);
      setMensaje({ tipo: 'ok', texto: 'Widget y respaldo sincronizados. Copia la URL de abajo en tu script de Scriptable.' });
    } catch (e) {
      setMensaje({
        tipo: 'error',
        texto: e instanceof WidgetSyncError ? e.message : 'No se pudo sincronizar. Revisa tu token de GitHub.',
      });
    } finally {
      setSincronizando(false);
    }
  }

  async function restaurarAhora() {
    if (!confirm('Esto remplazará tus notas locales con las del último respaldo en GitHub. ¿Continuar?')) return;
    setRestaurando(true);
    setMensaje(null);
    try {
      const cantidad = await restaurarBackupDesdeGitHub();
      setMensaje({ tipo: 'ok', texto: `Se restauraron ${cantidad} notas. Vuelve al inicio para verlas.` });
    } catch (e) {
      setMensaje({
        tipo: 'error',
        texto: e instanceof WidgetSyncError ? e.message : 'No se pudo restaurar el respaldo.',
      });
    } finally {
      setRestaurando(false);
    }
  }

  function copiarUrl() {
    navigator.clipboard.writeText(rawUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
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

      <section className="mb-6 rounded-2xl border border-line bg-surface p-4">
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
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-base text-bark focus:border-sage focus:outline-none"
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

      <section className="mb-6 rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-1 text-sm font-semibold text-bark">API key de Gemini (respaldo, opcional)</h3>
        <p className="mb-3 flex items-start gap-1.5 text-xs leading-relaxed text-bark-light">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-sage" />
          Si Groq llega a su límite de uso, la app intenta automáticamente con Gemini para que no te quedes sin
          resumen. Consíguela gratis en aistudio.google.com/apikey. Es opcional, pero recomendada.
        </p>
        <div className="relative">
          <input
            type={mostrarGeminiKey ? 'text' : 'password'}
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-base text-bark focus:border-sage focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMostrarGeminiKey((v) => !v)}
            aria-label={mostrarGeminiKey ? 'Ocultar API key' : 'Mostrar API key'}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-bark-light"
          >
            {mostrarGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={guardarGeminiApiKey}
          className="mt-3 w-full rounded-xl bg-sage py-3 text-sm font-semibold text-cream active:bg-sage-dark"
        >
          Guardar API key de respaldo
        </button>
      </section>

      <section className="mb-6 rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-1 text-sm font-semibold text-bark">Widget y respaldo (GitHub)</h3>
        <p className="mb-3 flex items-start gap-1.5 text-xs leading-relaxed text-bark-light">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-sage" />
          Para mostrar tu nota más reciente en un widget de pantalla de inicio, y respaldar todas tus notas
          automáticamente, necesitas un token de GitHub con permiso <strong>"gist"</strong> únicamente. Créalo en
          github.com/settings/tokens (Generate new token → classic → marca solo "gist"). Cada vez que guardes una
          nota o generes un resumen, se publica automáticamente en un Gist privado tuyo.
        </p>
        <div className="relative mb-3">
          <input
            type={mostrarToken ? 'text' : 'password'}
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_..."
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-base text-bark focus:border-sage focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMostrarToken((v) => !v)}
            aria-label={mostrarToken ? 'Ocultar token' : 'Mostrar token'}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-bark-light"
          >
            {mostrarToken ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={guardarGithubToken}
          className="mb-2 w-full rounded-xl bg-sage py-3 text-sm font-semibold text-cream active:bg-sage-dark"
        >
          Guardar token de GitHub
        </button>
        <button
          type="button"
          onClick={sincronizarAhora}
          disabled={sincronizando}
          className="mb-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium text-bark active:bg-cream-dark/40 disabled:opacity-50"
        >
          <RefreshCw size={16} className={sincronizando ? 'animate-spin' : ''} />
          Sincronizar ahora
        </button>
        <button
          type="button"
          onClick={restaurarAhora}
          disabled={restaurando}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium text-bark active:bg-cream-dark/40 disabled:opacity-50"
        >
          <CloudDownload size={16} className={restaurando ? 'animate-spin' : ''} />
          Restaurar respaldo desde GitHub
        </button>

        {rawUrl && (
          <div className="mt-3 rounded-xl bg-cream-dark/40 p-3">
            <p className="mb-1.5 text-xs font-medium text-bark-light">
              URL para pegar en tu script de Scriptable:
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs text-bark">{rawUrl}</code>
              <button
                type="button"
                onClick={copiarUrl}
                aria-label="Copiar URL"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-sage-dark"
              >
                {copiado ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
        )}
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

      <section className="mb-6 rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-1 text-sm font-semibold text-bark">Respaldo manual</h3>
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

      <section className="rounded-2xl border border-line bg-surface p-4">
        <button
          type="button"
          onClick={() => setAcercaDeAbierto((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-bark">
            <Info size={16} className="text-sage" />
            Acerca de Daily Bread
          </span>
          <ChevronDown size={18} className={`text-bark-light transition-transform ${acercaDeAbierto ? 'rotate-180' : ''}`} />
        </button>

        {acercaDeAbierto && (
          <div className="mt-3 space-y-3 text-xs leading-relaxed text-bark-light">
            <p>
              <strong className="text-bark">Notas:</strong> anota durante el servicio. Las referencias bíblicas
              que escribas (ej. "Juan 3:16") se detectan solas. Todo se guarda en este dispositivo, sin necesidad
              de internet.
            </p>
            <p>
              <strong className="text-bark">Resumen con IA:</strong> dentro de una nota, genera un resumen
              automático con Groq (y Gemini como respaldo si lo configuras arriba).
            </p>
            <p>
              <strong className="text-bark">Versículos:</strong> toca cualquier versículo guardado para leer el
              texto bíblico real (Reina-Valera 1960).
            </p>
            <p>
              <strong className="text-bark">Widget:</strong> con un token de GitHub puedes mostrar tu nota más
              reciente en un widget de pantalla de inicio (vía la app Scriptable) y respaldar tus notas
              automáticamente.
            </p>
            <p>
              <strong className="text-bark">Privacidad:</strong> no hay cuentas ni servidores propios. Tus claves
              y notas viven en el almacenamiento local de tu navegador, salvo lo que tú decidas sincronizar a tu
              propio Gist de GitHub.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
