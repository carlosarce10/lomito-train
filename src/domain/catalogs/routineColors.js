/**
 * Colores que puede tener una rutina.
 *
 * Lo que se persiste es el `id`, nunca el hexadecimal: un hex guardado no puede
 * adaptarse al tema oscuro. El `value` es presentacion y lo sustituye un token de
 * tema en la fase 4. Ver docs/data-model.md.
 */
export const ROUTINE_COLORS = [
  { id: 'lavender', value: '#818cf8' },
  { id: 'mint', value: '#34d399' },
  { id: 'sky', value: '#38bdf8' },
  { id: 'peach', value: '#fb923c' },
  { id: 'violet', value: '#c084fc' },
  { id: 'pink', value: '#f472b6' },
];

const BY_ID = new Map(ROUTINE_COLORS.map((color) => [color.id, color]));
const BY_VALUE = new Map(ROUTINE_COLORS.map((color) => [color.value.toLowerCase(), color]));

/** Ids validos, en orden de declaracion. */
export const ROUTINE_COLOR_IDS = ROUTINE_COLORS.map((color) => color.id);

/** Id del color por defecto de una rutina nueva. */
export const DEFAULT_ROUTINE_COLOR_ID = ROUTINE_COLORS[0].id;

/** Indica si un id pertenece a la paleta. */
export const isRoutineColorId = (id) => BY_ID.has(id);

/** Hexadecimal de un id, o el del color por defecto si no esta en la paleta. */
export const getRoutineColor = (id) => (BY_ID.get(id) ?? ROUTINE_COLORS[0]).value;

/**
 * Traduce un hexadecimal guardado por una version anterior a su id.
 * Solo la usa la migracion v2 a v3.
 *
 * @param {unknown} value Hexadecimal, en cualquier caja.
 * @returns {string | null} El id, o null si no esta en la paleta.
 */
export const routineColorIdFromValue = (value) =>
  typeof value === 'string' ? (BY_VALUE.get(value.toLowerCase())?.id ?? null) : null;
