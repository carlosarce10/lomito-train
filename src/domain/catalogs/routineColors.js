/**
 * Colores que puede tener una rutina.
 *
 * Hasta la fase 3 se persiste el hexadecimal, no el id, para no cambiar la forma
 * de los datos fuera de su migracion. `isRoutineColor` valida contra esta lista.
 */
export const ROUTINE_COLORS = [
  { id: 'lavender', value: '#818cf8' },
  { id: 'mint', value: '#34d399' },
  { id: 'sky', value: '#38bdf8' },
  { id: 'peach', value: '#fb923c' },
  { id: 'violet', value: '#c084fc' },
  { id: 'pink', value: '#f472b6' },
];

const VALUES = new Set(ROUTINE_COLORS.map((color) => color.value));

/** Valores hexadecimales admitidos, en orden de declaracion. */
export const ROUTINE_COLOR_VALUES = ROUTINE_COLORS.map((color) => color.value);

/** Color por defecto de una rutina nueva. */
export const DEFAULT_ROUTINE_COLOR = ROUTINE_COLORS[0].value;

/** Indica si un hexadecimal pertenece a la paleta de rutinas. */
export const isRoutineColor = (value) => VALUES.has(value);
