import * as r from '../validation/rules';

/** Preferencias de la aplicacion. Se rellenan en las fases 4 y 6. */
export const settingsSchema = {
  language: r.optional(r.oneOf(['es', 'en'])),
  theme: r.oneOf(['light', 'dark', 'system']),
};

/** Valores iniciales cuando no hay nada guardado. */
export const DEFAULT_SETTINGS = { language: null, theme: 'system' };
