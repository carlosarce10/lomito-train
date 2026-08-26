import { partition } from '../validation/validate';

import { getStore } from './store';

/**
 * Fabrica de colecciones persistidas y validadas.
 *
 * Distingue dos clases de problema, y la distincion importa:
 *
 * - Reparable: algo dentro del elemento esta mal pero el elemento sigue siendo
 *   util. Una rutina con una referencia a un ejercicio borrado no es una rutina
 *   perdida: es una rutina con una referencia menos. Se repara antes de validar.
 * - Irrecuperable: el elemento no cumple su propia forma. Se descarta y se cuenta,
 *   para que la interfaz pueda avisar en vez de reventar en el render.
 *
 * Sin esa distincion, un unico id corrupto borraria la rutina entera de la vista,
 * que es peor que el problema que se pretendia resolver. Ver docs/data-model.md.
 *
 * @param {string} key Clave del manifiesto.
 * @param {object} schema Esquema de cada elemento.
 * @param {(item: unknown) => unknown} [repair] Saneador previo de cada elemento.
 * @returns {{ store: object, getAll: () => Array, update: (fn: Function) => object,
 *            getRejected: () => Array }}
 */
export function createCollection(key, schema, repair = (item) => item) {
  let rechazados = [];

  const decode = (crudo) => {
    if (crudo === undefined) {
      rechazados = [];
      return [];
    }
    if (!Array.isArray(crudo)) {
      rechazados = [{ index: -1, issues: [{ path: '', code: 'notAList' }] }];
      return [];
    }

    const reparados = crudo.map((item) =>
      item !== null && typeof item === 'object' ? repair(item) : item,
    );
    const { valid, rejected } = partition(schema, reparados);
    rechazados = rejected;
    return valid;
  };

  const store = getStore(key, decode);

  return {
    store,

    /** Todos los elementos validos, en el orden guardado. */
    getAll: () => store.getSnapshot(),

    /**
     * Aplica una transformacion a la coleccion y la persiste.
     * Devuelve `{ ok: false, ... }` si la escritura fallo, sin cambiar el estado.
     */
    update: (fn) => store.set(fn),

    /** Elementos descartados en la ultima lectura por no cumplir su forma. */
    getRejected: () => rechazados,
  };
}
