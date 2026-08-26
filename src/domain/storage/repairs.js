import {
  DEFAULT_ROUTINE_COLOR_ID,
  isEquipmentId,
  isMuscleGroupId,
  isRoutineColorId,
} from '../catalogs';
import { LIMITS } from '../validation/limits';

const esId = (value) => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);

/**
 * Sanea un ejercicio antes de validarlo, sin perder el ejercicio por un detalle.
 *
 * @param {object} raw Ejercicio tal como esta guardado.
 * @returns {object} Ejercicio saneado.
 */
export function repairExercise(raw) {
  return {
    ...raw,
    muscleGroupIds: [
      ...new Set(
        (Array.isArray(raw.muscleGroupIds) ? raw.muscleGroupIds : []).filter(isMuscleGroupId),
      ),
    ].slice(0, LIMITS.muscleGroupsPerExercise.max),
    equipmentId: isEquipmentId(raw.equipmentId) ? raw.equipmentId : null,
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
    colorId: isRoutineColorId(raw.colorId) ? raw.colorId : DEFAULT_ROUTINE_COLOR_ID,
    exerciseIds: [...new Set(ids.filter(esId))].slice(0, LIMITS.exercisesPerRoutine.max),
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}
