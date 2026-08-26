import { FALLBACK_LANGUAGE, isLanguage, LANGUAGES } from './config';

/**
 * Decide el idioma inicial cuando el usuario no ha elegido ninguno.
 *
 * Orden: lo guardado en ajustes, luego las preferencias del navegador, y por
 * ultimo el idioma de respaldo. Solo se consulta el navegador la primera vez: una
 * vez el usuario elige, su eleccion manda aunque cambie el idioma del sistema.
 *
 * @param {string|null} guardado Idioma de los ajustes, o null si no hay.
 * @returns {'es'|'en'}
 */
export function detectLanguage(guardado) {
  if (isLanguage(guardado)) return guardado;

  const preferidos = Array.isArray(navigator.languages)
    ? navigator.languages
    : [navigator.language];
  for (const etiqueta of preferidos) {
    // Se compara solo la parte de idioma: 'es-CL' y 'es-419' valen como 'es'.
    const base = String(etiqueta ?? '')
      .toLowerCase()
      .split('-')[0];
    if (LANGUAGES.includes(base)) return base;
  }

  return FALLBACK_LANGUAGE;
}
