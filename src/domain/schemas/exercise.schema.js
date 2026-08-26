import { EQUIPMENT_IDS, MUSCLE_GROUP_IDS } from '../catalogs';
import { LIMITS } from '../validation/limits';
import * as r from '../validation/rules';

/** Forma de una serie: peso y repeticiones. */
export const setSchema = {
  id: r.id(),
  weight: r.number({
    min: LIMITS.weight.min,
    max: LIMITS.weight.max,
    decimals: LIMITS.weight.decimals,
  }),
  reps: r.number({ min: LIMITS.reps.min, max: LIMITS.reps.max, integer: true }),
};

/** Forma de un ejercicio del catalogo del usuario. */
export const exerciseSchema = {
  id: r.id(),
  name: r.text(LIMITS.name),
  muscleGroupIds: r.listOf({
    valores: MUSCLE_GROUP_IDS,
    min: LIMITS.muscleGroupsPerExercise.min,
    max: LIMITS.muscleGroupsPerExercise.max,
  }),
  equipmentId: r.optional(r.oneOf(EQUIPMENT_IDS)),
  sets: { __each: setSchema },
  createdAt: r.isoDate(),
  updatedAt: r.isoDate(),
};
