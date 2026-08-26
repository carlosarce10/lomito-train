import { ROUTINE_COLOR_VALUES } from '../catalogs';
import { LIMITS } from '../validation/limits';
import * as r from '../validation/rules';

/**
 * Forma de una rutina.
 *
 * `color` sigue siendo el hexadecimal; pasa a `colorId` en la fase 3. La ausencia
 * de huerfanos en `exerciseIds` no es parte del esquema porque depende de otra
 * coleccion: la comprueba integrity.js.
 */
export const routineSchema = {
  id: r.id(),
  name: r.text(LIMITS.name),
  color: r.oneOf(ROUTINE_COLOR_VALUES),
  exerciseIds: {
    __each: r.id(),
  },
  createdAt: r.isoDate(),
};
