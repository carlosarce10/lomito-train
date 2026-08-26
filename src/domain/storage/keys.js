/**
 * Manifiesto unico de claves de localStorage. Ninguna otra parte del codigo
 * escribe una clave como literal. Ver docs/data-model.md.
 */
export const KEYS = {
  meta: 'lomito-train-meta',
  exercises: 'lomito-train-exercises',
  routines: 'lomito-train-routines',
  settings: 'lomito-train-settings',
};

/**
 * Claves de versiones anteriores. Solo las leen las migraciones, para poder
 * renombrarlas; el resto del codigo usa KEYS.
 */
export const LEGACY_KEYS = {
  routines: 'lomito-train-workout-days',
};

/**
 * Claves de modulos ya eliminados. Las borra la migracion v3; se listan aqui para
 * que nadie las reintroduzca por descuido.
 */
export const OBSOLETE_KEYS = ['lomito-train-sessions', 'lomito-train-active-session'];
