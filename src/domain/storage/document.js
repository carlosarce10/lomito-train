import { validate } from '../validation/validate';

import { getStore } from './store';

/**
 * Fabrica de documentos persistidos: un unico objeto por clave, no una lista.
 *
 * A diferencia de una coleccion, aqui no hay nada que filtrar: si lo guardado no
 * cumple el esquema se usa el valor por defecto, porque un ajuste corrupto no debe
 * impedir que la aplicacion arranque.
 *
 * @param {string} key Clave del manifiesto.
 * @param {object} schema Esquema del documento.
 * @param {object} defaults Valores por defecto.
 * @returns {{ store: object, get: () => object, patch: (cambios: object) => object }}
 */
export function createDocument(key, schema, defaults) {
  const decode = (crudo) => {
    if (crudo === null || typeof crudo !== 'object') return defaults;
    // Se completa con los valores por defecto antes de validar, para que un ajuste
    // nuevo anadido en una version posterior no invalide lo que ya habia guardado.
    const completo = { ...defaults, ...crudo };
    return validate(schema, completo).ok ? completo : defaults;
  };

  const store = getStore(key, decode);

  return {
    store,
    get: () => store.getSnapshot(),
    patch: (cambios) => store.set((prev) => ({ ...prev, ...cambios })),
  };
}
