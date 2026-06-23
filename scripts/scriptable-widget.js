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

function crearWidget(nota) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#5b7a63");
  w.setPadding(14, 14, 14, 14);

  if (!nota) {
    const txt = w.addText("Aún no hay notas en Daily Bread");
    txt.font = Font.mediumSystemFont(13);
    txt.textColor = new Color("#faf7f2");
    return w;
  }

  const fecha = w.addText(formatearFecha(nota.fecha).toUpperCase());
  fecha.font = Font.semiboldSystemFont(11);
  fecha.textColor = new Color("#c98a5e");
  w.addSpacer(4);

  const titulo = w.addText(nota.tema || nota.predicador || "Nota");
  titulo.font = Font.boldSystemFont(15);
  titulo.textColor = new Color("#faf7f2");
  titulo.minimumScaleFactor = 0.8;
  titulo.lineLimit = 2;
  w.addSpacer(6);

  const mensaje = w.addText(nota.mensaje || "");
  mensaje.font = Font.regularSystemFont(12);
  mensaje.textColor = new Color("#faf7f2");
  mensaje.lineLimit = 5;
  mensaje.minimumScaleFactor = 0.85;

  w.addSpacer();

  if (nota.predicador) {
    const pie = w.addText(nota.predicador);
    pie.font = Font.regularSystemFont(10);
    pie.textColor = new Color("#d8c9b8");
  }

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
