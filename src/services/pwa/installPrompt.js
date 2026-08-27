/**
 * Instalacion de la aplicacion en el dispositivo.
 *
 * Chrome y Edge avisan con beforeinstallprompt cuando la aplicacion se puede
 * instalar, y ese evento hay que retenerlo para lanzar el dialogo mas tarde desde
 * un boton. Se escucha al importar el modulo, no al montar la pantalla de Ajustes:
 * el evento llega una sola vez, poco despues de cargar, y para entonces esa
 * pantalla casi nunca esta montada.
 *
 * iOS no tiene nada de esto. Alli instalar es Compartir y Anadir a pantalla de
 * inicio, y lo unico que puede hacer la aplicacion es explicarlo. Ver docs/pwa.md.
 */

let deferredPrompt = null;
let installed = isStandalone();
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Sin esto Chrome muestra su propia barra de instalacion cuando le parece.
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

/**
 * Indica si la aplicacion ya corre instalada, fuera de una pestana del navegador.
 *
 * @returns {boolean}
 */
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  // navigator.standalone solo existe en Safari de iOS, que no soporta la consulta.
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

/**
 * Indica si el dispositivo es un iPhone o un iPad.
 *
 * El iPad se presenta como un Mac desde iPadOS 13, y lo unico que lo delata es que
 * un Mac no tiene pantalla tactil.
 *
 * @returns {boolean}
 */
export function isIos() {
  if (typeof navigator === 'undefined') return false;
  const agent = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(agent)) return true;
  return /Macintosh/.test(agent) && navigator.maxTouchPoints > 1;
}

/**
 * Suscribe un oyente a los cambios: aparece el prompt o la aplicacion se instala.
 *
 * @param {() => void} listener
 * @returns {() => void} Funcion para darse de baja.
 */
export function subscribeInstallPrompt(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Estado de la instalacion. Devuelve una de tres situaciones excluyentes:
 * 'installed' si ya corre instalada, 'prompt' si el navegador ofrece dialogo,
 * 'manual' si hay que hacerlo desde el menu del navegador.
 *
 * @returns {'installed'|'prompt'|'manual'}
 */
export function getInstallState() {
  if (installed) return 'installed';
  return deferredPrompt ? 'prompt' : 'manual';
}

/**
 * Lanza el dialogo nativo de instalacion. El evento solo sirve una vez: si el
 * usuario lo rechaza, no vuelve a haber boton hasta que el navegador lo ofrezca
 * de nuevo.
 *
 * @returns {Promise<{ ok: boolean, outcome?: 'accepted'|'dismissed', error?: Error }>}
 */
export async function promptInstall() {
  const event = deferredPrompt;
  if (!event) return { ok: false, error: new Error('El navegador no ofrece instalacion') };
  deferredPrompt = null;
  notify();
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return { ok: true, outcome };
  } catch (error) {
    return { ok: false, error };
  }
}
