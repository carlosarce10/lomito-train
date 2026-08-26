import { normalizeText } from './normalize';
import { parseDecimal, parseInteger } from './parseDecimal';

/**
 * Cada regla recibe un valor y devuelve `null` si es valido, o un objeto
 * `{ code, params }` si no lo es. El `code` es la clave del mensaje: la capa de
 * presentacion lo traduce, la de dominio nunca escribe texto para el usuario.
 */

/** Texto obligatorio, con longitud entre min y max tras normalizar. */
export const text =
  ({ min = 1, max = Infinity } = {}) =>
  (value) => {
    const limpio = normalizeText(value);
    if (limpio.length === 0) return { code: 'required' };
    if (limpio.length < min) return { code: 'tooShort', params: { min } };
    if (limpio.length > max) return { code: 'tooLong', params: { max } };
    return null;
  };

/** Numero dentro de un rango, opcionalmente multiplo de un paso. */
export const number =
  ({ min = -Infinity, max = Infinity, step = null, integer = false } = {}) =>
  (value) => {
    const n = integer ? parseInteger(value) : parseDecimal(value);
    if (n === null) return { code: integer ? 'notInteger' : 'notANumber' };
    if (n < min) return { code: 'tooSmall', params: { min } };
    if (n > max) return { code: 'tooLarge', params: { max } };
    // Se compara con tolerancia porque 0.1 + 0.2 no es 0.3 en coma flotante.
    if (step !== null && Math.abs(Math.round(n / step) * step - n) > 1e-9) {
      return { code: 'notAStep', params: { step } };
    }
    return null;
  };

/** El valor debe pertenecer a un conjunto cerrado. */
export const oneOf = (valores) => (value) =>
  valores.includes(value) ? null : { code: 'notInCatalog' };

/** Lista cuyos elementos pertenecen a un conjunto cerrado, sin duplicados. */
export const listOf =
  ({ valores, min = 0, max = Infinity }) =>
  (value) => {
    if (!Array.isArray(value)) return { code: 'notAList' };
    if (value.length < min) return { code: 'tooFewItems', params: { min } };
    if (value.length > max) return { code: 'tooManyItems', params: { max } };
    if (new Set(value).size !== value.length) return { code: 'duplicateItems' };
    if (value.some((item) => !valores.includes(item))) return { code: 'notInCatalog' };
    return null;
  };

/** Identificador con forma de uuid. */
export const id = () => (value) =>
  typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value) ? null : { code: 'invalidId' };

/** Marca de tiempo ISO valida. */
export const isoDate = () => (value) =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? null : { code: 'invalidDate' };

/** Hace opcional cualquier regla: null y undefined pasan. */
export const optional = (regla) => (value) =>
  value === null || value === undefined ? null : regla(value);
