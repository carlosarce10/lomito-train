import { EQUIPMENT_IDS, MUSCLE_GROUP_IDS } from '../catalogs';
import { LIMITS } from '../validation/limits';
import * as r from '../validation/rules';

/** Forma de una serie: peso y repeticiones. */
export const setSchema = {
  id: r.id(),
  weight: r.number({ min: LIMITS.weight.min, max: LIMITS.weight.max, step: LIMITS.weight.step }),
  reps: r.number({ min: LIMITS.reps.min, max: LIMITS.reps.max, integer: true }),
};

/**
 * Forma de un ejercicio del catalogo del usuario.
 *
 * `muscleGroup` sigue siendo el escalar derivado de `categories[0]`. Ambos campos
 * se funden en `muscleGroupIds` en la fase 3, con su migracion. Ver docs/plan.md.
 */
export const exerciseSchema = {
  id: r.id(),
  name: r.text(LIMITS.name),
  muscleGroup: r.oneOf(MUSCLE_GROUP_IDS),
  categories: r.listOf({
    valores: MUSCLE_GROUP_IDS,
    min: LIMITS.muscleGroupsPerExercise.min,
    max: LIMITS.muscleGroupsPerExercise.max,
  }),
  equipment: r.optional(r.oneOf(['', ...EQUIPMENT_IDS])),
  sets: { __each: setSchema },
  createdAt: r.isoDate(),
  updatedAt: r.isoDate(),
};
