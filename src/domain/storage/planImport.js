import { createExercise, createSet } from '../model/exercise';
import { createRoutine } from '../model/routine';
import { exerciseSchema, routineSchema } from '../schemas';
import { LIMITS } from '../validation/limits';
import { toComparableText } from '../validation/normalize';
import { validate } from '../validation/validate';

import * as driver from './driver';
import { KEYS } from './keys';

/**
 * Importacion del plan que exporta Lomito Workouts.
 *
 * Un plan no es una copia de seguridad: no sustituye nada, se fusiona con lo que el
 * usuario ya tiene. Es la diferencia que importa, porque el plan llega de otra
 * aplicacion y el usuario tiene aqui sus series de semanas. Reglas, en
 * docs/export.md:
 *
 * - Un ejercicio del plan con el mismo nombre que uno existente es ese ejercicio: se
 *   reutiliza con sus series y su marca, sin tocarlo.
 * - Un ejercicio nuevo se crea con tantas series vacias como series efectivas pide
 *   el plan, para que el usuario solo tenga que anotar.
 * - Una rutina del plan con el mismo nombre que una existente se actualiza con los
 *   ejercicios del plan, conservando su id y su color. Por eso importar dos veces el
 *   mismo plan, o una revision del plan, no duplica nada.
 * - Nada se borra nunca.
 */

/** Version del formato del plan que entiende esta aplicacion. */
export const PLAN_VERSION = 1;

/**
 * Indica si un contenido ya parseado es un plan de Lomito Workouts.
 *
 * @param {unknown} crudo Contenido del fichero.
 * @returns {boolean}
 */
export const isPlanFile = (crudo) =>
  crudo !== null && typeof crudo === 'object' && crudo.app === 'lomito-workouts';

/**
 * Comprueba el envoltorio de un plan y devuelve sus listas, sin escribir nada.
 *
 * @param {unknown} crudo Contenido del fichero ya parseado.
 * @returns {{ ok: true, title: string, exercises: Array, routines: Array }
 *         | { ok: false, reason: 'notAPlan'|'planTooNew'|'corrupt' }}
 */
export function readPlan(crudo) {
  if (!isPlanFile(crudo) || crudo.kind !== 'plan') return { ok: false, reason: 'notAPlan' };
  if (!Number.isInteger(crudo.planVersion)) return { ok: false, reason: 'corrupt' };
  if (crudo.planVersion > PLAN_VERSION) return { ok: false, reason: 'planTooNew' };

  const datos = crudo.data;
  if (datos === null || typeof datos !== 'object') return { ok: false, reason: 'corrupt' };
  if (!Array.isArray(datos.exercises) || !Array.isArray(datos.routines)) {
    return { ok: false, reason: 'corrupt' };
  }

  const exercises = datos.exercises.filter(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.key === 'string' &&
      typeof item.name === 'string',
  );
  const routines = datos.routines.filter(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.name === 'string' &&
      Array.isArray(item.exerciseKeys),
  );

  return {
    ok: true,
    title: typeof crudo.title === 'string' ? crudo.title : '',
    exercises,
    routines,
    discarded:
      datos.exercises.length - exercises.length + (datos.routines.length - routines.length),
  };
}

/**
 * Fusiona un plan con los datos guardados. Valida todo antes de escribir.
 *
 * @param {unknown} crudo Contenido del fichero ya parseado.
 * @returns {{ ok: true, exercisesCreated: number, exercisesReused: number,
 *             routinesCreated: number, routinesUpdated: number, descartados: number }
 *         | { ok: false, reason: string }}
 */
export function importPlan(crudo) {
  const plan = readPlan(crudo);
  if (!plan.ok) return plan;

  const lecturaEjercicios = driver.read(KEYS.exercises);
  if (!lecturaEjercicios.ok) return { ok: false, reason: lecturaEjercicios.reason };
  const lecturaRutinas = driver.read(KEYS.routines);
  if (!lecturaRutinas.ok) return { ok: false, reason: lecturaRutinas.reason };

  const ejerciciosActuales = Array.isArray(lecturaEjercicios.value) ? lecturaEjercicios.value : [];
  const rutinas = Array.isArray(lecturaRutinas.value) ? [...lecturaRutinas.value] : [];

  // ── Ejercicios: se reutilizan por nombre o se crean ────────────────────────
  const idPorNombre = new Map(ejerciciosActuales.map((ex) => [toComparableText(ex.name), ex.id]));
  const idPorClave = new Map();
  const nuevos = [];
  let reutilizados = 0;
  let descartados = plan.discarded;

  for (const item of plan.exercises) {
    const nombre = toComparableText(item.name);
    if (idPorNombre.has(nombre)) {
      idPorClave.set(item.key, idPorNombre.get(nombre));
      if (!nuevos.some((ex) => ex.id === idPorNombre.get(nombre))) reutilizados += 1;
      continue;
    }

    const ejercicio = createExercise({
      name: item.name,
      muscleGroupIds: item.muscleGroupIds,
      equipmentId: item.equipmentId,
    });
    const series = Number.isInteger(item.setCount)
      ? Math.min(Math.max(item.setCount, 0), LIMITS.setsPerExercise.max)
      : 0;
    ejercicio.sets = Array.from({ length: series }, createSet);

    if (!validate(exerciseSchema, ejercicio).ok) {
      descartados += 1;
      continue;
    }
    nuevos.push(ejercicio);
    idPorNombre.set(nombre, ejercicio.id);
    idPorClave.set(item.key, ejercicio.id);
  }

  // ── Rutinas: se actualizan por nombre o se crean ───────────────────────────
  const indicePorNombre = new Map(rutinas.map((rutina, i) => [toComparableText(rutina.name), i]));
  let creadas = 0;
  let actualizadas = 0;

  for (const item of plan.routines) {
    const exerciseIds = [
      ...new Set(item.exerciseKeys.map((clave) => idPorClave.get(clave)).filter(Boolean)),
    ].slice(0, LIMITS.exercisesPerRoutine.max);
    const nombre = toComparableText(item.name);

    if (indicePorNombre.has(nombre)) {
      const indice = indicePorNombre.get(nombre);
      rutinas[indice] = { ...rutinas[indice], exerciseIds, updatedAt: new Date().toISOString() };
      actualizadas += 1;
      continue;
    }

    const rutina = { ...createRoutine({ name: item.name, colorId: item.colorId }), exerciseIds };
    if (!validate(routineSchema, rutina).ok) {
      descartados += 1;
      continue;
    }
    rutinas.push(rutina);
    indicePorNombre.set(nombre, rutinas.length - 1);
    creadas += 1;
  }

  // Los ejercicios nuevos van delante, como los que crea el usuario; las rutinas
  // nuevas, detras. Primero los ejercicios: una rutina nunca apunta a un ejercicio
  // que no se haya guardado.
  const escrituraEjercicios = driver.write(KEYS.exercises, [...nuevos, ...ejerciciosActuales]);
  if (!escrituraEjercicios.ok) return { ok: false, reason: escrituraEjercicios.reason };

  const escrituraRutinas = driver.write(KEYS.routines, rutinas);
  if (!escrituraRutinas.ok) return { ok: false, reason: escrituraRutinas.reason };

  return {
    ok: true,
    exercisesCreated: nuevos.length,
    exercisesReused: reutilizados,
    routinesCreated: creadas,
    routinesUpdated: actualizadas,
    descartados,
  };
}
