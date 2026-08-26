/**
 * Acceso crudo a localStorage. Es el unico modulo del proyecto que lo toca.
 *
 * Toda operacion devuelve un resultado explicito en lugar de tragar la excepcion:
 * un almacenamiento lleno o bloqueado (Safari en privado, ITP) hacia que la app
 * diera por guardado lo que nunca se escribio. Ver docs/data-model.md.
 */

/** Indica si hay un almacenamiento utilizable en este navegador. */
export function isAvailable() {
  try {
    const sonda = '__lomito_probe__';
    window.localStorage.setItem(sonda, '1');
    window.localStorage.removeItem(sonda);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lee y deserializa una clave.
 *
 * @param {string} key Clave del manifiesto.
 * @returns {{ ok: true, value: unknown, found: boolean } | { ok: false, error: Error, reason: string }}
 */
export function read(key) {
  let crudo;
  try {
    crudo = window.localStorage.getItem(key);
  } catch (error) {
    return { ok: false, error, reason: 'unavailable' };
  }

  if (crudo === null) return { ok: true, value: undefined, found: false };

  try {
    return { ok: true, value: JSON.parse(crudo), found: true };
  } catch (error) {
    // El dato existe pero no es JSON. Se informa en lugar de devolver el valor
    // por defecto, para no sobrescribir despues algo que quiza se pueda rescatar.
    return { ok: false, error, reason: 'corrupt' };
  }
}

/**
 * Serializa y escribe una clave.
 *
 * @param {string} key Clave del manifiesto.
 * @param {unknown} value Valor serializable.
 * @returns {{ ok: true } | { ok: false, error: Error, reason: string }}
 */
export function write(key, value) {
  let serializado;
  try {
    serializado = JSON.stringify(value);
  } catch (error) {
    return { ok: false, error, reason: 'notSerializable' };
  }

  try {
    window.localStorage.setItem(key, serializado);
    return { ok: true };
  } catch (error) {
    const lleno = error?.name === 'QuotaExceededError' || error?.code === 22;
    return { ok: false, error, reason: lleno ? 'quotaExceeded' : 'unavailable' };
  }
}

/**
 * Borra una clave.
 *
 * @param {string} key Clave del manifiesto.
 * @returns {{ ok: true } | { ok: false, error: Error }}
 */
export function remove(key) {
  try {
    window.localStorage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/** Devuelve el contenido crudo de todas las claves de la aplicacion, para rescate. */
export function dumpRaw() {
  const volcado = {};
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith('lomito-train')) volcado[key] = window.localStorage.getItem(key);
    }
  } catch {
    return volcado;
  }
  return volcado;
}
