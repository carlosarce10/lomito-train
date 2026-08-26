import { UNITS } from '../catalogs';
import * as r from '../validation/rules';

/** Preferencias de la aplicacion. */
export const settingsSchema = {
  language: r.optional(r.oneOf(['es', 'en'])),
  theme: r.oneOf(['light', 'dark', 'system']),
  unit: r.oneOf(UNITS),
};

/** Valores iniciales cuando no hay nada guardado. */
export const DEFAULT_SETTINGS = { language: null, theme: 'system', unit: 'kg' };
