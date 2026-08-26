import { v4 as uuid } from 'uuid';

import { DEFAULT_ROUTINE_COLOR, isRoutineColor } from '../catalogs';
import { LIMITS } from '../validation/limits';
import { normalizeText } from '../validation/normalize';

/**
 * Crea una rutina normalizada, con el color acotado a la paleta.
 *
 * @param {{ name: string, color?: string }} datos
 * @returns {object} Rutina lista para guardar.
 */
export function createRoutine({ name, color } = {}) {
  return {
    id: uuid(),
    name: normalizeText(name),
    color: isRoutineColor(color) ? color : DEFAULT_ROUTINE_COLOR,
    exerciseIds: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Aplica cambios a una rutina. El original no se muta.
 *
 * @param {object} routine Rutina existente.
 * @param {{ name?: string, color?: string }} cambios
 * @returns {object} Rutina nueva.
 */
export function updateRoutine(routine, cambios) {
  const siguiente = { ...routine };
  if ('name' in cambios) {
    const nombre = normalizeText(cambios.name);
    if (nombre.length >= LIMITS.name.min) siguiente.name = nombre;
  }
  if ('color' in cambios && isRoutineColor(cambios.color)) siguiente.color = cambios.color;
  return siguiente;
}

/** Anade un ejercicio al final, sin duplicarlo y respetando el tope. */
export function addExerciseToRoutine(routine, exerciseId) {
  if (routine.exerciseIds.includes(exerciseId)) return routine;
  if (routine.exerciseIds.length >= LIMITS.exercisesPerRoutine.max) return routine;
  return { ...routine, exerciseIds: [...routine.exerciseIds, exerciseId] };
}

/** Quita un ejercicio de la rutina. */
export function removeExerciseFromRoutine(routine, exerciseId) {
  return { ...routine, exerciseIds: routine.exerciseIds.filter((id) => id !== exerciseId) };
}

/** Mueve un ejercicio de posicion. Ignora indices fuera de rango. */
export function reorderRoutineExercises(routine, from, to) {
  const ids = [...routine.exerciseIds];
  if (from < 0 || from >= ids.length || to < 0 || to >= ids.length) return routine;
  const [movido] = ids.splice(from, 1);
  ids.splice(to, 0, movido);
  return { ...routine, exerciseIds: ids };
}

/**
 * Resuelve los ids de una rutina a ejercicios reales, descartando los huerfanos.
 * Es el unico sitio donde se hace esa resolucion: antes se repetia en cada
 * componente con un `.map().filter(Boolean)`.
 *
 * @param {object} routine Rutina.
 * @param {Array} exercises Catalogo completo.
 * @returns {Array} Ejercicios en el orden de la rutina.
 */
export function resolveRoutineExercises(routine, exercises) {
  const porId = new Map(exercises.map((ex) => [ex.id, ex]));
  return routine.exerciseIds.map((id) => porId.get(id)).filter(Boolean);
}
