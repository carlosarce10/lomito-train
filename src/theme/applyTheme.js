import { DEFAULT_THEME, isTheme } from './themes';

/**
 * Aplica un tema al documento.
 *
 * Escribe data-theme en el elemento raiz y sincroniza meta[name=theme-color], que
 * es el color de la barra del navegador y de la PWA instalada. Antes estaba fijo en
 * un azul claro, asi que en tema oscuro la barra del sistema quedaba blanca.
 *
 * Comparte contrato con el script en linea de index.html: si cambia el nombre del
 * atributo o de la clave, hay que cambiarlo en los dos sitios.
 *
 * @param {'light'|'dark'|'system'} theme Tema elegido.
 * @returns {'light'|'dark'} El tema que ha quedado activo de hecho.
 */
export function applyTheme(theme) {
  const elegido = isTheme(theme) ? theme : DEFAULT_THEME;
  const raiz = document.documentElement;

  if (elegido === 'system') raiz.removeAttribute('data-theme');
  else raiz.setAttribute('data-theme', elegido);

  const efectivo = resolveTheme(elegido);

  // El valor sale del token, no de un literal: asi la barra del navegador no puede
  // divergir del fondo de la aplicacion.
  const color = getComputedStyle(raiz).getPropertyValue('--theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && color) meta.setAttribute('content', color);

  return efectivo;
}

/**
 * Resuelve que tema se ve de hecho, teniendo en cuenta el del sistema.
 *
 * @param {'light'|'dark'|'system'} theme
 * @returns {'light'|'dark'}
 */
export function resolveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
