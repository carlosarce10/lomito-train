import { registerSW } from 'virtual:pwa-register';

/**
 * Registro del service worker y estado de la actualizacion.
 *
 * Adaptador sobre el modulo virtual de vite-plugin-pwa: es el unico sitio del
 * proyecto que lo importa. En desarrollo ese modulo es un no-op, asi que aqui no
 * hace falta distinguir entornos. Expone un almacen minimo con la forma que espera
 * useSyncExternalStore, igual que los repositorios del dominio, para que la interfaz
 * se entere sin que este archivo conozca React. Detalle en docs/pwa.md.
 */

// Cada cuanto se pregunta al servidor si hay una version nueva mientras la
// aplicacion sigue abierta. Sin esto, una sesion larga en el gimnasio no se
// enteraria nunca: el navegador solo comprueba al navegar.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

let state = { needRefresh: false, offlineReady: false, error: null };
const listeners = new Set();
let updateServiceWorker = null;
let registered = false;

function setState(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

/**
 * Registra el service worker. Es idempotente: la segunda llamada no hace nada.
 *
 * @returns {void}
 */
export function registerServiceWorker() {
  if (registered) return;
  registered = true;

  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh: () => setState({ needRefresh: true }),
    onOfflineReady: () => setState({ offlineReady: true }),
    onRegisteredSW: (_url, registration) => {
      if (!registration) return;
      window.setInterval(() => {
        // Sin red la comprobacion fallaria con un error de fetch en la consola por
        // cada intervalo. No es un fallo: es que no hay red.
        if (navigator.onLine !== false) registration.update();
      }, UPDATE_CHECK_INTERVAL);
    },
    onRegisterError: (error) => setState({ error }),
  });
}

/**
 * Suscribe un oyente a los cambios de estado.
 *
 * @param {() => void} listener
 * @returns {() => void} Funcion para darse de baja.
 */
export function subscribeServiceWorker(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Estado actual. La referencia solo cambia cuando cambia el contenido.
 *
 * @returns {{ needRefresh: boolean, offlineReady: boolean, error: Error|null }}
 */
export function getServiceWorkerState() {
  return state;
}

/**
 * Activa la version que esta esperando. El service worker nuevo toma el control y
 * la pagina se recarga sola: los datos no corren peligro porque viven en
 * localStorage y se escriben en cada cambio.
 *
 * @returns {Promise<void>}
 */
export async function applyUpdate() {
  if (updateServiceWorker) await updateServiceWorker(true);
}

/**
 * Oculta el aviso de version nueva hasta la proxima comprobacion.
 *
 * @returns {void}
 */
export function dismissUpdate() {
  setState({ needRefresh: false });
}

/**
 * Marca el aviso de "listo sin conexion" como mostrado.
 *
 * @returns {void}
 */
export function acknowledgeOfflineReady() {
  setState({ offlineReady: false });
}
