import { DEFAULT_SETTINGS, exerciseSchema, routineSchema, settingsSchema } from '../schemas';

import { createCollection } from './collection';
import { createDocument } from './document';
import { KEYS } from './keys';
import { repairExercise, repairRoutine } from './repairs';

/**
 * Instancias unicas de cada almacen. Se crean una sola vez por clave, asi que todos
 * los consumidores comparten el mismo estado y la misma suscripcion.
 */
export const exercisesRepository = createCollection(KEYS.exercises, exerciseSchema, repairExercise);
export const routinesRepository = createCollection(KEYS.routines, routineSchema, repairRoutine);
export const settingsRepository = createDocument(KEYS.settings, settingsSchema, DEFAULT_SETTINGS);
