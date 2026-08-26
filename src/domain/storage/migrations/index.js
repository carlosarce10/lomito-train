import * as driver from '../driver';
import { KEYS } from '../keys';

import { up as v1ToV2 } from './v1-to-v2';
import { up as v2ToV3 } from './v2-to-v3';

/**
 * Registro ordenado de migraciones. Anadir una entrada aqui es lo unico que hace
 * falta: CURRENT_VERSION se deriva de la lista, asi que no pueden desincronizarse.
 */
const MIGRATIONS = [
  { version: 2, up: v1ToV2 },
  { version: 3, up: v2ToV3 },
];

/** Version de esquema que espera este build. */
export const CURRENT_VERSION = MIGRATIONS.at(-1).version;

/**
 * Ejecuta las migraciones pendientes y devuelve un resultado explicito.
 *
 * Cuatro reglas, cada una por un defecto real del runner anterior:
 * no sella una version que no ha migrado, no sella si alguna escritura fallo,
 * no degrada una version superior, y trata el meta corrupto como instalacion v1.
 * Ver docs/data-model.md.
 *
 * @returns {{ ok: true, from: number, to: number, applied: number[] }
 *         | { ok: false, reason: string, at?: number, error?: Error }}
 */
export function runMigrations() {
  if (!driver.isAvailable()) return { ok: false, reason: 'unavailable' };

  const desde = leerVersion();

  // El usuario abrio un build mas nuevo antes que este. Rebajar la version haria
  // que las migraciones se reejecutasen sobre datos ya migrados.
  if (desde > CURRENT_VERSION) {
    return { ok: false, reason: 'downgrade', at: desde };
  }

  const aplicadas = [];
  let version = desde;

  for (const migracion of MIGRATIONS) {
    if (migracion.version <= version) continue;

    const resultado = migracion.up();
    if (!resultado.ok) {
      return { ...resultado, ok: false, at: migracion.version, from: desde };
    }

    // Se sella dentro del bucle, tras cada paso: si el siguiente falla, lo ya
    // migrado queda registrado y no se repite en el proximo arranque.
    const sellado = escribirVersion(migracion.version);
    if (!sellado.ok) {
      return { ...sellado, ok: false, at: migracion.version, from: desde };
    }

    version = migracion.version;
    aplicadas.push(migracion.version);
  }

  return { ok: true, from: desde, to: version, applied: aplicadas };
}

function leerVersion() {
  const lectura = driver.read(KEYS.meta);
  // Meta corrupto o ausente: se trata como instalacion v1. Es lo conservador,
  // porque las migraciones son idempotentes y volver a pasarlas no destruye nada.
  if (!lectura.ok || !lectura.found) return 1;
  const version = lectura.value?.schemaVersion;
  return Number.isInteger(version) && version >= 1 ? version : 1;
}

function escribirVersion(version) {
  const lectura = driver.read(KEYS.meta);
  const meta =
    lectura.ok && lectura.found && typeof lectura.value === 'object' ? lectura.value : {};
  return driver.write(KEYS.meta, { ...meta, schemaVersion: version });
}
