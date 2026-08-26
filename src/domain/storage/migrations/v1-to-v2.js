import * as driver from '../driver';
import { KEYS } from '../keys';

/**
 * v1 a v2: rellena `categories` a partir del escalar `muscleGroup`.
 *
 * @returns {{ ok: true } | { ok: false, error?: Error, reason: string }}
 */
export function up() {
  const lectura = driver.read(KEYS.exercises);
  if (!lectura.ok) return lectura;
  if (!lectura.found) return { ok: true };

  const ejercicios = lectura.value;
  if (!Array.isArray(ejercicios)) return { ok: false, reason: 'corrupt' };

  const migrados = ejercicios.map((ex) => ({
    ...ex,
    categories: ex.categories ?? (ex.muscleGroup ? [ex.muscleGroup] : []),
  }));

  return driver.write(KEYS.exercises, migrados);
}
