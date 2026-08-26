import { isEquipmentId, isMuscleGroupId, isRoutineColor, DEFAULT_ROUTINE_COLOR } from '../catalogs';
import { LIMITS } from '../validation/limits';

const esId = (value) => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);

/**
 * Sanea un ejercicio antes de validarlo, sin perder el ejercicio por un detalle.
 *
 * @param {object} raw Ejercicio tal como esta guardado.
 * @returns {object} Ejercicio saneado.
 */
export function repairExercise(raw) {
  const grupos = [
    ...new Set(
      (Array.isArray(raw.categories) ? raw.categories : [raw.muscleGroup]).filter(isMuscleGroupId),
    ),
  ].slice(0, LIMITS.muscleGroupsPerExercise.max);

  return {
    ...raw,
    categories: grupos,
    muscleGroup: grupos[0] ?? raw.muscleGroup,
    equipment: isEquipmentId(raw.equipment) ? raw.equipment : '',
    // Una serie con forma imposible se descarta; el ejercicio se conserva.
    sets: (Array.isArray(raw.sets) ? raw.sets : []).filter(
      (set) =>
        set !== null &&
        typeof set === 'object' &&
        esId(set.id) &&
        Number.isFinite(set.weight) &&
        Number.isFinite(set.reps),
    ),
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

/**
 * Sanea una rutina. Las referencias invalidas o repetidas se caen; la rutina no.
 *
 * @param {object} raw Rutina tal como esta guardada.
 * @returns {object} Rutina saneada.
 */
export function repairRoutine(raw) {
  const ids = Array.isArray(raw.exerciseIds) ? raw.exerciseIds : [];
  return {
    ...raw,
    color: isRoutineColor(raw.color) ? raw.color : DEFAULT_ROUTINE_COLOR,
    exerciseIds: [...new Set(ids.filter(esId))].slice(0, LIMITS.exercisesPerRoutine.max),
  };
}
