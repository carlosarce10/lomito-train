// Caracteres de control C0 y C1, marcas bidireccionales, espacios de anchura cero
// y BOM. Producen nombres invisibles y son la primera puerta de la inyeccion de
// formulas en Excel. Ver docs/validation.md y docs/export.md.
const INVISIBLES = new RegExp(
  '[' +
    '\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F' + // control C0 y DEL
    '\\u0080-\\u009F' + // control C1
    '\\u200B-\\u200F' + // anchura cero y marcas de direccion
    '\\u202A-\\u202E' + // incrustaciones bidireccionales
    '\\u2066-\\u2069' + // aislamientos bidireccionales
    '\\uFEFF' + // BOM
    ']',
  'g',
);

/**
 * Normaliza un texto escrito por el usuario antes de validarlo o guardarlo:
 * quita caracteres invisibles, colapsa espacios internos y recorta los extremos.
 *
 * @param {unknown} value Valor crudo, de cualquier tipo.
 * @returns {string} Texto normalizado. Cadena vacia si no era un string.
 */
export function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(INVISIBLES, '').replace(/\s+/g, ' ').trim();
}

/**
 * Normaliza para comparar: sin acentos y en minusculas. Se usa para detectar
 * duplicados y para buscar, nunca para guardar.
 *
 * @param {unknown} value Valor crudo.
 * @returns {string} Clave de comparacion.
 */
export function toComparableText(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
