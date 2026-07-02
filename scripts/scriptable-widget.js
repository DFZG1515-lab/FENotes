// Daily Bread - Widget de la nota más reciente
//
// Cómo usarlo:
// 1. Instala la app "Scriptable" (gratis) desde la App Store.
// 2. Abre Scriptable, crea un script nuevo y pega TODO este contenido.
// 3. En Daily Bread, ve a Configuración > Widget para iPhone, guarda tu token de
//    GitHub y toca "Sincronizar ahora". Copia la URL que te muestra.
// 4. Pega esa URL abajo, reemplazando el valor de GIST_URL.
// 5. Mantén presionada la pantalla de inicio de tu iPhone > toca "+" > busca
//    "Scriptable" > elige el tamaño (pequeño o mediano) > agrégalo > tócalo y elige este script.

const GIST_URL = "PEGA_AQUI_LA_URL_QUE_TE_DIO_LA_APP";

// Paleta oscura de la app (src/index.css), siempre activa sin importar el modo del sistema.
const MODO_OSCURO = true;

const GRADIENTE_INICIO = new Color(MODO_OSCURO ? "#262220" : "#5b7a63");
const GRADIENTE_FIN    = new Color(MODO_OSCURO ? "#1d1a16" : "#34473b");
const TEXTO            = new Color(MODO_OSCURO ? "#f1ebe0" : "#faf7f2");
const ACENTO           = new Color(MODO_OSCURO ? "#dba074" : "#c98a5e");
const TEXTO_SOBRE_ACENTO = new Color(MODO_OSCURO ? "#2a1f16" : "#faf7f2");
const SEPARADOR        = new Color(MODO_OSCURO ? "#3a342c" : "#ffffff30");

async function obtenerNota() {
  try {
    const req = new Request(GIST_URL + (GIST_URL.includes("?") ? "&" : "?") + "t=" + Date.now());
    return await req.loadJSON();
  } catch (e) {
    return null;
  }
}

function formatearFecha(fecha) {
  if (!fecha) return "";
  const [anio, mes, dia] = fecha.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${dia} ${meses[parseInt(mes, 10) - 1]} ${anio}`;
}

function fondoConProfundidad() {
  const gradiente = new LinearGradient();
  gradiente.colors = [GRADIENTE_INICIO, GRADIENTE_FIN];
  gradiente.locations = [0, 1];
  gradiente.startPoint = new Point(0, 0);
  gradiente.endPoint = new Point(1, 1);
  return gradiente;
}

// ─── Widget PEQUEÑO ──────────────────────────────────────────────────────────

function crearWidgetPequeno(nota) {
  const w = new ListWidget();
  w.backgroundGradient = fondoConProfundidad();
  w.setPadding(14, 12, 12, 12);

  if (!nota) {
    const txt = w.addText("Aún no hay notas en Daily Bread");
    txt.font = Font.mediumSystemFont(13);
    txt.textColor = TEXTO;
    return w;
  }

  const fila = w.addStack();
  fila.layoutHorizontally();

  // Franja de acento (lomo de libro).
  const franja = fila.addStack();
  franja.backgroundColor = ACENTO;
  franja.cornerRadius = 2;
  franja.size = new Size(3, 112);

  fila.addSpacer(10);

  const contenido = fila.addStack();
  contenido.layoutVertically();

  // Fecha como píldora.
  const pill = contenido.addStack();
  pill.layoutHorizontally();
  pill.backgroundColor = ACENTO;
  pill.cornerRadius = 6;
  pill.setPadding(3, 8, 3, 8);
  const txtFecha = pill.addText(formatearFecha(nota.fecha).toUpperCase());
  txtFecha.font = Font.semiboldSystemFont(10);
  txtFecha.textColor = TEXTO_SOBRE_ACENTO;

  contenido.addSpacer(7);

  const titulo = contenido.addText(nota.tema || nota.predicador || "Nota");
  titulo.font = Font.boldSystemFont(15);
  titulo.textColor = TEXTO;
  titulo.minimumScaleFactor = 0.8;
  titulo.lineLimit = 2;

  contenido.addSpacer(5);

  const mensaje = contenido.addText(nota.mensaje || "");
  mensaje.font = Font.regularSystemFont(12);
  mensaje.textColor = TEXTO;
  mensaje.textOpacity = 0.88;
  mensaje.lineLimit = 4;
  mensaje.minimumScaleFactor = 0.85;

  contenido.addSpacer();

  // Pie: predicador + marca.
  const pie = contenido.addStack();
  pie.layoutHorizontally();
  pie.centerAlignContent();

  if (nota.predicador) {
    const txtPredicador = pie.addText(nota.predicador);
    txtPredicador.font = Font.italicSystemFont(10);
    txtPredicador.textColor = TEXTO;
    txtPredicador.textOpacity = 0.65;
  }

  pie.addSpacer();

  const marca = pie.addImage(SFSymbol.named("cross.case.fill").image);
  marca.imageSize = new Size(13, 13);
  marca.tintColor = TEXTO;
  marca.imageOpacity = 0.35;

  return w;
}

// ─── Widget MEDIANO ───────────────────────────────────────────────────────────

function crearWidgetMediano(nota) {
  const w = new ListWidget();
  w.backgroundGradient = fondoConProfundidad();
  w.setPadding(14, 14, 12, 14);

  if (!nota) {
    const txt = w.addText("Aún no hay notas en Daily Bread");
    txt.font = Font.mediumSystemFont(13);
    txt.textColor = TEXTO;
    return w;
  }

  const fila = w.addStack();
  fila.layoutHorizontally();
  fila.centerAlignContent();

  // ── Columna izquierda ──
  const izquierda = w.addStack ? fila.addStack() : fila.addStack();
  izquierda.layoutVertically();
  izquierda.size = new Size(148, 0);

  // Fecha.
  const pill = izquierda.addStack();
  pill.layoutHorizontally();
  pill.backgroundColor = ACENTO;
  pill.cornerRadius = 6;
  pill.setPadding(3, 8, 3, 8);
  const txtFecha = pill.addText(formatearFecha(nota.fecha).toUpperCase());
  txtFecha.font = Font.semiboldSystemFont(9);
  txtFecha.textColor = TEXTO_SOBRE_ACENTO;

  izquierda.addSpacer(8);

  // Tema.
  const titulo = izquierda.addText(nota.tema || "Nota del sermón");
  titulo.font = Font.boldSystemFont(14);
  titulo.textColor = TEXTO;
  titulo.minimumScaleFactor = 0.75;
  titulo.lineLimit = 3;

  izquierda.addSpacer();

  // Predicador e iglesia al pie.
  if (nota.predicador) {
    const txtPredicador = izquierda.addText(nota.predicador);
    txtPredicador.font = Font.italicSystemFont(10);
    txtPredicador.textColor = TEXTO;
    txtPredicador.textOpacity = 0.6;
    txtPredicador.lineLimit = 1;
  }
  if (nota.iglesia) {
    const txtIglesia = izquierda.addText(nota.iglesia);
    txtIglesia.font = Font.regularSystemFont(9);
    txtIglesia.textColor = TEXTO;
    txtIglesia.textOpacity = 0.4;
    txtIglesia.lineLimit = 1;
  }

  // ── Separador vertical ──
  fila.addSpacer(12);

  const sep = fila.addStack();
  sep.backgroundColor = SEPARADOR;
  sep.size = new Size(1, 110);

  fila.addSpacer(12);

  // ── Columna derecha — puntos del sermón ──
  const derecha = fila.addStack();
  derecha.layoutVertically();

  const puntos = (nota.puntosPrincipales && nota.puntosPrincipales.length > 0)
    ? nota.puntosPrincipales
    : (nota.mensaje ? [nota.mensaje] : []);

  if (puntos.length === 0) {
    const vacío = derecha.addText("Genera un resumen con IA en la app para ver los puntos del sermón aquí.");
    vacío.font = Font.regularSystemFont(11);
    vacío.textColor = TEXTO;
    vacío.textOpacity = 0.5;
    vacío.lineLimit = 5;
  } else {
    for (let i = 0; i < Math.min(puntos.length, 3); i++) {
      if (i > 0) derecha.addSpacer(6);

      const fila_punto = derecha.addStack();
      fila_punto.layoutHorizontally();

      // Número del punto.
      const num = fila_punto.addText(`${i + 1}`);
      num.font = Font.semiboldSystemFont(10);
      num.textColor = ACENTO;
      num.minimumScaleFactor = 1;

      fila_punto.addSpacer(5);

      const txt = fila_punto.addText(puntos[i]);
      txt.font = Font.regularSystemFont(11);
      txt.textColor = TEXTO;
      txt.textOpacity = 0.9;
      txt.lineLimit = 3;
      txt.minimumScaleFactor = 0.85;
    }
  }

  derecha.addSpacer();

  // Marca de agua abajo a la derecha.
  const pie = derecha.addStack();
  pie.layoutHorizontally();
  pie.addSpacer();
  const marca = pie.addImage(SFSymbol.named("cross.case.fill").image);
  marca.imageSize = new Size(11, 11);
  marca.tintColor = TEXTO;
  marca.imageOpacity = 0.25;

  return w;
}

// ─── Entrada principal ────────────────────────────────────────────────────────

const nota = await obtenerNota();
const familia = config.widgetFamily ?? "small";
const widget = familia === "medium"
  ? crearWidgetMediano(nota)
  : crearWidgetPequeno(nota);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Vista previa: presenta el tamaño correspondiente al script elegido.
  if (familia === "medium") {
    await widget.presentMedium();
  } else {
    await widget.presentSmall();
  }
}
Script.complete();
