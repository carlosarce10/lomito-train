/**
 * Configuracion de idiomas. Es la fuente de verdad de que idiomas existen.
 */
export const LANGUAGES = ['es', 'en'];

/** Idioma al que se cae cuando falta una clave o el detectado no esta soportado. */
export const FALLBACK_LANGUAGE = 'es';

/** Espacios de nombres. Uno por area de la interfaz, mas los transversales. */
export const NAMESPACES = ['common', 'exercises', 'routines', 'settings', 'catalog', 'validation'];

/** Indica si un codigo de idioma esta soportado. */
export const isLanguage = (value) => LANGUAGES.includes(value);

/** Nombre del idioma en su propio idioma, para el selector. */
export const LANGUAGE_LABELS = { es: 'Espa\u00f1ol', en: 'English' };
