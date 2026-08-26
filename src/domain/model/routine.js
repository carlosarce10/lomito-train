import { v4 as uuid } from 'uuid';

import { DEFAULT_ROUTINE_COLOR_ID, isRoutineColorId } from '../catalogs';
import { LIMITS } from '../validation/limits';
import { normalizeText } from '../validation/normalize';

/**
 * Crea una rutina normalizada, con el color acotado a la paleta.
 *
 * @param {{ name: string, color?: string }} datos
 * @returns {object} Rutina lista para guardar.
 */
export function createRoutine({ name, colorId } = {}) {
  const marca = new Date().toISOString();
  return {
    id: uuid(),
    name: normalizeText(name),
    colorId: isRoutineColorId(colorId) ? colorId : DEFAULT_ROUTINE_COLOR_ID,
    exerciseIds: [],
    createdAt: marca,
    updatedAt: marca,
  };
}

/**
 * Aplica cambios a una rutina. El original no se muta.
 *
 * @param {object} routine Rutina existente.
 * @param {{ name?: string, colorId?: string }} cambios
 * @returns {object} Rutina nueva.
 */
export function updateRoutine(routine, cambios) {
  const siguiente = { ...routine, updatedAt: new Date().toISOString() };
  if ('name' in cambios) {
    const nombre = normalizeText(cambios.name);
    if (nombre.length >= LIMITS.name.min) siguiente.name = nombre;
  }
  if ('colorId' in cambios && isRoutineColorId(cambios.colorId)) {
    siguiente.colorId = cambios.colorId;
  }
  return siguiente;
}

/** Anade un ejercicio al final, sin duplicarlo y respetando el tope. */
export function addExerciseToRoutine(routine, exerciseId) {
  if (routine.exerciseIds.includes(exerciseId)) return routine;
  if (routine.exerciseIds.length >= LIMITS.exercisesPerRoutine.max) return routine;
  return conMarca({ ...routine, exerciseIds: [...routine.exerciseIds, exerciseId] });
}

/** Quita un ejercicio de la rutina. */
export function removeExerciseFromRoutine(routine, exerciseId) {
  return conMarca({
    ...routine,
    exerciseIds: routine.exerciseIds.filter((id) => id !== exerciseId),
  });
}

/** Mueve un ejercicio de posicion. Ignora indices fuera de rango. */
export function reorderRoutineExercises(routine, from, to) {
  const ids = [...routine.exerciseIds];
  if (from < 0 || from >= ids.length || to < 0 || to >= ids.length) return routine;
  const [movido] = ids.splice(from, 1);
  ids.splice(to, 0, movido);
  return conMarca({ ...routine, exerciseIds: ids });
}

/** Refresca updatedAt. Toda modificacion de una rutina pasa por aqui. */
const conMarca = (routine) => ({ ...routine, updatedAt: new Date().toISOString() });

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
