/**
 * Convierte a numero un decimal escrito por una persona, aceptando coma y punto.
 *
 * Existe porque un <input type="number"> devuelve cadena vacia cuando el usuario
 * escribe "22,5" en un teclado espanol. El codigo anterior lo interpretaba como 0
 * y persistia 0 mientras la pantalla seguia mostrando 22,5. Ver docs/validation.md.
 *
 * @param {unknown} value Texto crudo tal como lo escribio el usuario.
 * @returns {number | null} El numero, o null si no es un decimal valido.
 */
export function parseDecimal(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const limpio = value.trim().replace(/\s/g, '');
  if (limpio === '') return null;

  // Se admite un unico separador decimal, coma o punto, pero no los dos.
  if ((limpio.match(/[.,]/g) ?? []).length > 1) return null;
  if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(limpio)) return null;

  const numero = Number(limpio.replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Convierte a entero lo que escribe el usuario. Rechaza los decimales en lugar de
 * truncarlos en silencio: 8,5 repeticiones es un error, no un 8.
 *
 * @param {unknown} value Texto crudo.
 * @returns {number | null} El entero, o null si no lo es.
 */
export function parseInteger(value) {
  const numero = parseDecimal(value);
  if (numero === null) return null;
  return Number.isInteger(numero) ? numero : null;
}
