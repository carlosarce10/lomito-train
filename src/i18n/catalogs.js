import catalogEn from './locales/en/catalog.json';
import commonEn from './locales/en/common.json';
import exercisesEn from './locales/en/exercises.json';
import routinesEn from './locales/en/routines.json';
import settingsEn from './locales/en/settings.json';
import validationEn from './locales/en/validation.json';
import catalogEs from './locales/es/catalog.json';
import commonEs from './locales/es/common.json';
import exercisesEs from './locales/es/exercises.json';
import routinesEs from './locales/es/routines.json';
import settingsEs from './locales/es/settings.json';
import validationEs from './locales/es/validation.json';

/**
 * Diccionarios de todos los idiomas.
 *
 * Se importan de forma estatica y no con import() diferido: pesan unos 3 kB gzip
 * entre los dos idiomas, y cargarlos aparte produciria un primer render con las
 * claves crudas a la vista.
 */
export const CATALOGS = {
  es: {
    common: commonEs,
    exercises: exercisesEs,
    routines: routinesEs,
    settings: settingsEs,
    catalog: catalogEs,
    validation: validationEs,
  },
  en: {
    common: commonEn,
    exercises: exercisesEn,
    routines: routinesEn,
    settings: settingsEn,
    catalog: catalogEn,
    validation: validationEn,
  },
};
