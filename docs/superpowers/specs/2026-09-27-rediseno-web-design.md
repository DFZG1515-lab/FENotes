# Rediseño web de Daily Bread — "la nota como página de Biblia"

Fecha: 2026-09-27. Propuesta visual aprobada en el lienzo
https://claude.ai/artifact/PHjrQWidkcmToZ3UKdwPwp

## Objetivo

Que Daily Bread funcione como aplicación web en escritorio sin perder la experiencia
de celular (PWA). Un solo código, responsivo, con corte en `lg` (1024px).

## Idea central

La nota se trata como una página de Biblia: lo que se anota va al centro en serifa y
los versículos mencionados viven "al margen", con la referencia en dorado y el texto en
itálica. Es el mismo bloque (`VersiculoMargen`) en escritorio, celular y widget.

## Sistema visual

- **Color**: cuero `#1F1915` (barra lateral), papel `#F4EFE4` (fondo), página `#FBF8F2`
  (lectura), tinta `#221C18`, tinta suave `#6B5F55`, listón `#7A1F2B` (único acento
  fuerte), dorado `#8A6A22` (referencias), canto dorado `#C9AA5E` (filos), línea `#E2D9C8`.
  Los alias antiguos (`cream`, `bark`, `sage`, `clay`) apuntan a la nueva paleta.
- **Tipografía**: Newsreader (títulos, cuerpo de nota, citas bíblicas) y Karla (interfaz),
  autoalojadas con `@fontsource` para que funcionen sin conexión.
- **Firma**: el listón de marcador de Biblia (`.ribbon`, con cola de golondrina) marca la
  sección activa en la barra lateral y en la navegación inferior, la nota abierta en
  escritorio y las destacadas en celular.

## Estructura

- `Layout`: barra lateral (`Sidebar`, solo `lg`) + contenido. En celular conserva la
  cabecera compacta y la navegación inferior de cuatro pestañas (Hoy, Notas, Versículos,
  Asistente) con botón flotante para nueva nota.
- `NotasSplit`: en escritorio muestra la lista de notas (372px) y la página de lectura a la
  derecha; en celular muestra solo una según la ruta. `/notas` en escritorio muestra
  `NotasVacio`.
- `NuevaNota`: modo escritura sin barra lateral. Metadatos en una línea (escritorio) o en
  un resumen desplegable (celular); área grande en serifa; margen con versículos
  detectados y chat de IA acoplado. En celular el margen es un panel inferior fijo con
  chips y la pregunta a la IA.
- `Devocional`: pantalla de apertura con el versículo del día; en escritorio muestra la
  marca a la izquierda y los botones en fila.
- `storage` emite `fenotes:notas-cambiaron` para que la lista abierta se refresque al
  guardar, destacar o eliminar desde el panel de lectura.

## Fuera de alcance

El widget de Scriptable no cambia. No hay modo oscuro en la app principal (solo el
devocional y el splash son oscuros).
