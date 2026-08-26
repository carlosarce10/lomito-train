import * as driver from '@/domain/storage/driver';
import { pruneOrphanExerciseIds } from '@/domain/storage/integrity';
import { KEYS } from '@/domain/storage/keys';
import { runMigrations } from '@/domain/storage/migrations';
import { exercisesRepository, routinesRepository } from '@/domain/storage/repositories';

/**
 * Prepara el almacenamiento antes de montar la aplicacion.
 *
 * Devuelve siempre un resultado explicito. Si algo falla, main.jsx decide que
 * pintar en lugar de arrancar sobre datos en un estado desconocido.
 *
 * @returns {{ ok: boolean, reason?: string, migration?: object, pruned?: number,
 *             rewritten?: string[], rejected?: number }}
 */
export function bootstrap() {
  const migracion = runMigrations();
  if (!migracion.ok) return { ok: false, reason: migracion.reason, migration: migracion };

  // Los repositorios se leen aqui por primera vez, ya con la migracion aplicada.
  // Lo que devuelven esta saneado y validado; lo que hay en disco puede no estarlo.
  const ejercicios = exercisesRepository.getAll();
  const { routines, removed } = pruneOrphanExerciseIds(routinesRepository.getAll(), ejercicios);

  if (removed > 0) routinesRepository.update(() => routines);

  // El saneado y las migraciones viven en memoria hasta que alguien escribe. Se
  // consolidan ahora para que el disco refleje lo que la aplicacion esta usando:
  // si no, un exportador que leyera el crudo veria datos que la interfaz descarta.
  const rewritten = [
    consolidar(KEYS.exercises, exercisesRepository.getAll()),
    consolidar(KEYS.routines, routinesRepository.getAll()),
  ].filter(Boolean);

  const rejected =
    exercisesRepository.getRejected().length + routinesRepository.getRejected().length;

  return { ok: true, migration: migracion, pruned: removed, rewritten, rejected };
}

/** Reescribe una clave si lo guardado no coincide con lo que la app tiene en memoria. */
function consolidar(key, enMemoria) {
  const lectura = driver.read(key);
  if (!lectura.ok) return null;
  if (JSON.stringify(lectura.value ?? []) === JSON.stringify(enMemoria)) return null;
  return driver.write(key, enMemoria).ok ? key : null;
}
