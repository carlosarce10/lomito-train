import { ROUTINE_COLOR_IDS } from '../catalogs';
import { LIMITS } from '../validation/limits';
import * as r from '../validation/rules';

/**
 * Forma de una rutina.
 *
 * La ausencia de huerfanos en `exerciseIds` no es parte del esquema porque depende
 * de otra coleccion: la comprueba integrity.js.
 */
export const routineSchema = {
  id: r.id(),
  name: r.text(LIMITS.name),
  colorId: r.oneOf(ROUTINE_COLOR_IDS),
  exerciseIds: { __each: r.id() },
  createdAt: r.isoDate(),
  updatedAt: r.isoDate(),
};
