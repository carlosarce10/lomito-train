import * as driver from './driver';

/**
 * Store reactivo por clave de almacenamiento, compartido por todo el arbol.
 *
 * Existe por dos defectos concretos del hook anterior. Primero, cada llamada a
 * useLocalStorage creaba su propia copia del array: dos componentes montados a la
 * vez divergian. Segundo, no se escuchaba el evento `storage`, asi que dos
 * pestanas se pisaban la coleccion entera. Ver docs/data-model.md.
 */

const stores = new Map();

/**
 * Devuelve el store de una clave, creandolo la primera vez.
 *
 * @param {string} key Clave del manifiesto.
 * @param {(crudo: unknown) => unknown} decode Normaliza y valida lo leido.
 * @returns {{ getSnapshot: () => unknown, subscribe: (fn: () => void) => () => void,
 *            set: (siguiente: unknown) => object, reload: () => void }}
 */
export function getStore(key, decode) {
  const existente = stores.get(key);
  if (existente) return existente;

  let snapshot = decode(leerCrudo(key));
  const suscriptores = new Set();
  let ultimoError = null;

  const notificar = () => suscriptores.forEach((fn) => fn());

  const store = {
    getSnapshot: () => snapshot,

    getLastError: () => ultimoError,

    subscribe(fn) {
      suscriptores.add(fn);
      // El primer suscriptor engancha el listener; el ultimo en irse lo suelta.
      if (suscriptores.size === 1) window.addEventListener('storage', alCambiarOtraPestana);
      return () => {
        suscriptores.delete(fn);
        if (suscriptores.size === 0) {
          window.removeEventListener('storage', alCambiarOtraPestana);
        }
      };
    },

    /**
     * Aplica un valor nuevo o una funcion actualizadora y lo persiste.
     * Si la escritura falla, revierte el snapshot para que la interfaz no muestre
     * un dato que no llego a guardarse.
     */
    set(siguiente) {
      const anterior = snapshot;
      const valor = typeof siguiente === 'function' ? siguiente(anterior) : siguiente;

      snapshot = valor;
      const resultado = driver.write(key, valor);

      if (!resultado.ok) {
        snapshot = anterior;
        ultimoError = resultado;
        notificar();
        return resultado;
      }

      ultimoError = null;
      notificar();
      return { ok: true };
    },

    /** Relee del almacen. La usa la pantalla de recuperacion tras un rescate. */
    reload() {
      snapshot = decode(leerCrudo(key));
      notificar();
    },
  };

  function alCambiarOtraPestana(evento) {
    if (evento.key !== null && evento.key !== key) return;
    snapshot = decode(leerCrudo(key));
    notificar();
  }

  stores.set(key, store);
  return store;
}

function leerCrudo(key) {
  const resultado = driver.read(key);
  return resultado.ok ? resultado.value : undefined;
}

/** Vacia el registro de stores. Solo para pruebas. */
export function resetStores() {
  stores.clear();
}
