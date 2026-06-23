// Daily Bread - Widget de la nota más reciente
//
// Cómo usarlo:
// 1. Instala la app "Scriptable" (gratis) desde la App Store.
// 2. Abre Scriptable, crea un script nuevo y pega TODO este contenido.
// 3. En Daily Bread, ve a Configuración > Widget para iPhone, guarda tu token de
//    GitHub y toca "Sincronizar ahora". Copia la URL que te muestra.
// 4. Pega esa URL abajo, reemplazando el valor de GIST_URL.
// 5. Mantén presionada la pantalla de inicio de tu iPhone > toca "+" > busca
//    "Scriptable" > elige el tamaño pequeño > agrégalo > tócalo y elige este script.

const GIST_URL = "PEGA_AQUI_LA_URL_QUE_TE_DIO_LA_APP";

const SAGE = new Color("#5b7a63");
const SAGE_DARK = new Color("#34473b");
const CLAY = new Color("#c98a5e");
const CREAM = new Color("#faf7f2");

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
  gradiente.colors = [SAGE, SAGE_DARK];
  gradiente.locations = [0, 1];
  gradiente.startPoint = new Point(0, 0);
  gradiente.endPoint = new Point(1, 1);
  return gradiente;
}

function crearWidget(nota) {
  const w = new ListWidget();
  w.backgroundGradient = fondoConProfundidad();
  w.setPadding(14, 12, 12, 12);

  if (!nota) {
    const txt = w.addText("Aún no hay notas en Daily Bread");
    txt.font = Font.mediumSystemFont(13);
    txt.textColor = CREAM;
    return w;
  }

  const fila = w.addStack();
  fila.layoutHorizontally();

  // Franja de acento (lomo de libro) a la izquierda.
  const franja = fila.addStack();
  franja.backgroundColor = CLAY;
  franja.cornerRadius = 2;
  franja.size = new Size(3, 112);

  fila.addSpacer(10);

  const contenido = fila.addStack();
  contenido.layoutVertically();

  // Fecha como "sello" / píldora.
  const pill = contenido.addStack();
  pill.layoutHorizontally();
  pill.backgroundColor = CLAY;
  pill.cornerRadius = 6;
  pill.setPadding(3, 8, 3, 8);
  const txtFecha = pill.addText(formatearFecha(nota.fecha).toUpperCase());
  txtFecha.font = Font.semiboldSystemFont(10);
  txtFecha.textColor = CREAM;

  contenido.addSpacer(7);

  const titulo = contenido.addText(nota.tema || nota.predicador || "Nota");
  titulo.font = Font.boldSystemFont(15);
  titulo.textColor = CREAM;
  titulo.minimumScaleFactor = 0.8;
  titulo.lineLimit = 2;

  contenido.addSpacer(5);

  const mensaje = contenido.addText(nota.mensaje || "");
  mensaje.font = Font.regularSystemFont(12);
  mensaje.textColor = CREAM;
  mensaje.textOpacity = 0.88;
  mensaje.lineLimit = 4;
  mensaje.minimumScaleFactor = 0.85;

  contenido.addSpacer();

  // Pie: predicador + ícono de marca como marca de agua sutil.
  const pie = contenido.addStack();
  pie.layoutHorizontally();
  pie.centerAlignContent();

  if (nota.predicador) {
    const txtPredicador = pie.addText(nota.predicador);
    txtPredicador.font = Font.italicSystemFont(10);
    txtPredicador.textColor = CREAM;
    txtPredicador.textOpacity = 0.65;
  }

  pie.addSpacer();

  const marca = pie.addImage(SFSymbol.named("cross.case.fill").image);
  marca.imageSize = new Size(13, 13);
  marca.tintColor = CREAM;
  marca.imageOpacity = 0.35;

  return w;
}

const nota = await obtenerNota();
const widget = crearWidget(nota);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentSmall();
}
Script.complete();
