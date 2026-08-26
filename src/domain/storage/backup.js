import { exerciseSchema, routineSchema } from '../schemas';
import { partition } from '../validation/validate';

import * as driver from './driver';
import { pruneOrphanExerciseIds } from './integrity';
import { KEYS } from './keys';
import { repairExercise, repairRoutine } from './repairs';

/**
 * Copia de seguridad completa en JSON.
 *
 * Es la unica via de llevar los datos de un dispositivo a otro. Aqui no hay servidor,
 * asi que este fichero es la unica copia que existe fuera del navegador.
 */

/** Version del formato de la copia. Sube si cambia la forma del envoltorio. */
export const BACKUP_VERSION = 1;

/**
 * Construye el objeto de la copia a partir de lo que hay guardado.
 *
 * @param {number} schemaVersion Version del esquema persistido.
 * @param {Array} exercises
 * @param {Array} routines
 * @returns {object}
 */
export function buildBackup(schemaVersion, exercises, routines) {
  return {
    app: 'lomito-train',
    backupVersion: BACKUP_VERSION,
    schemaVersion,
    exportedAt: new Date().toISOString(),
    data: { exercises, routines },
  };
}

/**
 * Valida y aplica una copia de seguridad.
 *
 * Nunca escribe a medias: valida todo primero y solo entonces persiste, para que un
 * fichero corrupto no deje la aplicacion con los ejercicios importados y las rutinas
 * viejas. Los elementos que no cumplen el esquema se descartan y se cuentan.
 *
 * @param {unknown} crudo Contenido del fichero ya parseado.
 * @returns {{ ok: true, exercises: number, routines: number, descartados: number }
 *         | { ok: false, reason: string }}
 */
export function importBackup(crudo) {
  if (crudo === null || typeof crudo !== 'object') return { ok: false, reason: 'notAnObject' };
  if (crudo.app !== 'lomito-train') return { ok: false, reason: 'notLomitoTrain' };
  if (!Number.isInteger(crudo.schemaVersion)) return { ok: false, reason: 'corrupt' };

  const datos = crudo.data;
  if (datos === null || typeof datos !== 'object') return { ok: false, reason: 'corrupt' };

  const ejerciciosCrudos = Array.isArray(datos.exercises) ? datos.exercises : [];
  const rutinasCrudas = Array.isArray(datos.routines) ? datos.routines : [];

  const ejercicios = partition(exerciseSchema, ejerciciosCrudos.map(repairExercise));
  const rutinas = partition(routineSchema, rutinasCrudas.map(repairRoutine));

  // Las referencias a ejercicios que no llegaron se caen aqui, no despues.
  const { routines } = pruneOrphanExerciseIds(rutinas.valid, ejercicios.valid);

  const escrituraEjercicios = driver.write(KEYS.exercises, ejercicios.valid);
  if (!escrituraEjercicios.ok) return { ok: false, reason: escrituraEjercicios.reason };

  const escrituraRutinas = driver.write(KEYS.routines, routines);
  if (!escrituraRutinas.ok) return { ok: false, reason: escrituraRutinas.reason };

  return {
    ok: true,
    exercises: ejercicios.valid.length,
    routines: routines.length,
    descartados: ejercicios.rejected.length + rutinas.rejected.length,
  };
}
