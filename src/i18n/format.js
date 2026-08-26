/**
 * Formateo de numeros, pesos y fechas con el idioma activo.
 *
 * Es el unico sitio del proyecto donde se instancia Intl. Antes habia un
 * Intl.DateTimeFormat('es') con el locale escrito a mano, de modo que en ingles
 * las fechas seguian saliendo en espanol.
 *
 * Los formateadores se cachean porque construir un Intl.NumberFormat es caro y
 * estos se llaman en cada fila de cada tabla de series.
 */
const cache = new Map();

const obtener = (clave, fabrica) => {
  if (!cache.has(clave)) cache.set(clave, fabrica());
  return cache.get(clave);
};

/** Presets cerrados. No se pasan opciones sueltas desde los componentes. */
const NUMEROS = {
  weight: { maximumFractionDigits: 2 },
  reps: { maximumFractionDigits: 0 },
  integer: { maximumFractionDigits: 0 },
};

const FECHAS = {
  date: { day: 'numeric', month: 'short', year: 'numeric' },
  dateTime: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
};

/**
 * Formatea un numero con un preset.
 *
 * @param {number} value Valor.
 * @param {'weight'|'reps'|'integer'} preset Preset.
 * @param {string} language Idioma activo.
 * @returns {string}
 */
export function formatNumber(value, preset, language) {
  if (!Number.isFinite(value)) return '';
  return obtener(
    `n:${preset}:${language}`,
    () => new Intl.NumberFormat(language, NUMEROS[preset] ?? NUMEROS.integer),
  ).format(value);
}

/**
 * Formatea una fecha ISO con un preset. Devuelve cadena vacia si no es valida,
 * nunca "Invalid Date".
 *
 * @param {string} iso Marca de tiempo ISO.
 * @param {'date'|'dateTime'} preset Preset.
 * @param {string} language Idioma activo.
 * @returns {string}
 */
export function formatDate(iso, preset, language) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return obtener(
    `d:${preset}:${language}`,
    () => new Intl.DateTimeFormat(language, FECHAS[preset] ?? FECHAS.date),
  ).format(fecha);
}

/**
 * Categoria de plural de un numero segun el idioma.
 *
 * Se usa Intl.PluralRules y no un ternario: un ternario acierta en espanol y en
 * ingles por casualidad, no por diseno, y se rompe en cuanto entra un idioma con
 * mas de dos categorias.
 *
 * @param {number} count Cantidad.
 * @param {string} language Idioma activo.
 * @returns {string} 'one', 'other', y las que el idioma tenga.
 */
export function pluralCategory(count, language) {
  return obtener(`p:${language}`, () => new Intl.PluralRules(language)).select(count);
}

/**
 * Formatea una fecha como tiempo relativo: "hace 3 dias", "3 days ago".
 *
 * Se resuelve con Intl.RelativeTimeFormat y no restando cadenas a mano, para que el
 * plural y el orden de las palabras los ponga el idioma y no un ternario.
 *
 * @param {string} iso Marca de tiempo.
 * @param {string} language Idioma activo.
 * @returns {string} Texto relativo, o cadena vacia si la fecha no es valida.
 */
export function formatRelative(iso, language) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';

  const rtf = obtener(
    `r:${language}`,
    () => new Intl.RelativeTimeFormat(language, { numeric: 'auto' }),
  );
  const segundos = Math.round((fecha.getTime() - Date.now()) / 1000);

  const UNIDADES = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unidad, tamano] of UNIDADES) {
    if (Math.abs(segundos) >= tamano) return rtf.format(Math.round(segundos / tamano), unidad);
  }
  return rtf.format(0, 'day');
}

/**
 * Convierte a numero un decimal escrito por el usuario en el idioma activo.
 *
 * Es el inverso de formatNumber y vive en el mismo modulo a proposito: si el
 * formateo y el parseo se separan, acaban discrepando en el separador decimal.
 *
 * @param {string} texto Texto crudo.
 * @param {string} language Idioma activo.
 * @returns {number|null}
 */
export function parseLocalizedNumber(texto, language) {
  if (typeof texto !== 'string') return null;
  const separador = obtener(`s:${language}`, () => {
    const partes = new Intl.NumberFormat(language).formatToParts(1.1);
    return partes.find((p) => p.type === 'decimal')?.value ?? '.';
  });
  const limpio = texto.trim().split(separador).join('.').replace(',', '.');
  const numero = Number(limpio);
  return Number.isFinite(numero) && limpio !== '' ? numero : null;
}
