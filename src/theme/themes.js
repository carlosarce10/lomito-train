/**
 * Los tres estados del tema. `system` no es un tema: es la ausencia de eleccion,
 * y sigue a prefers-color-scheme.
 */
export const THEMES = ['light', 'dark', 'system'];

/** Tema por defecto de una instalacion nueva. */
export const DEFAULT_THEME = 'system';

/** Indica si un valor es un tema valido. */
export const isTheme = (value) => THEMES.includes(value);
