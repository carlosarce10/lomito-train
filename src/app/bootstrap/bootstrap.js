import * as driver from '@domain/storage/driver';
import { pruneOrphanExerciseIds } from '@domain/storage/integrity';
import { KEYS } from '@domain/storage/keys';
import { runMigrations } from '@domain/storage/migrations';
import { exercisesRepository, routinesRepository } from '@domain/storage/repositories';

/**
 * Prepara el almacenamiento antes de montar la aplicacion.
 *
 * @returns {{ ok: boolean, reason?: string, migration?: object, pruned?: number,
 *             normalized?: string[], rejected?: number }}
 */
export function bootstrap() {
  const migracion = runMigrations();
  if (!migracion.ok) return { ok: false, reason: migracion.reason, migration: migracion };

  // Los repositorios leen y validan al crearse, y eso ocurre al importar el modulo,
  // es decir ANTES de esta funcion. Si acaba de correr una migracion, el snapshot
  // que tienen en memoria se decodifico contra el esquema anterior. Hay que releer.
  exercisesRepository.store.reload();
  routinesRepository.store.reload();

  const ejercicios = exercisesRepository.getAll();
  const { routines, removed } = pruneOrphanExerciseIds(routinesRepository.getAll(), ejercicios);
  if (removed > 0) routinesRepository.update(() => routines);

  // El saneado vive en memoria hasta que alguien escribe. Se consolida ahora para
  // que el disco refleje lo que la aplicacion usa, y asi un exportador no lea datos
  // que la interfaz descarta.
  const normalized = [
    normalizar(KEYS.exercises, exercisesRepository.getAll()),
    normalizar(KEYS.routines, routinesRepository.getAll()),
  ].filter(Boolean);

  const rejected =
    exercisesRepository.getRejected().length + routinesRepository.getRejected().length;

  return { ok: true, migration: migracion, pruned: removed, normalized, rejected };
}

/**
 * Reescribe una clave si lo guardado no coincide con lo que la app tiene en memoria.
 *
 * Nunca escribe si eso reduciria el numero de elementos. Que la validacion rechace
 * algo es motivo para avisar, jamas para borrarlo del disco: el dato rechazado
 * puede ser recuperable a mano o por una migracion futura, y aqui no hay servidor
 * del que volver a bajarlo.
 */
function normalizar(key, enMemoria) {
  const lectura = driver.read(key);
  if (!lectura.ok) return null;

  const guardado = Array.isArray(lectura.value) ? lectura.value : [];
  if (enMemoria.length < guardado.length) return null;
  if (JSON.stringify(guardado) === JSON.stringify(enMemoria)) return null;

  return driver.write(key, enMemoria).ok ? key : null;
}
