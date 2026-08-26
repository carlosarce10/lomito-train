import {
  DEFAULT_ROUTINE_COLOR_ID,
  isEquipmentId,
  isMuscleGroupId,
  routineColorIdFromValue,
} from '../../catalogs';
import * as driver from '../driver';
import { KEYS, LEGACY_KEYS, OBSOLETE_KEYS } from '../keys';

const esId = (value) => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);

/**
 * v2 a v3: unifica el vocabulario del modelo de datos.
 *
 * - `muscleGroup` y `categories` se funden en `muscleGroupIds`.
 * - `equipment` pasa a `equipmentId`, con null en lugar de cadena vacia.
 * - El color de la rutina pasa de hexadecimal a `colorId`.
 * - Las rutinas ganan `updatedAt`.
 * - La clave `lomito-train-workout-days` se renombra a `lomito-train-routines`.
 * - Se borran las dos claves del modulo de sesiones eliminado.
 *
 * @returns {{ ok: true } | { ok: false, error?: Error, reason: string }}
 */
export function up() {
  const ejercicios = migrarEjercicios();
  if (!ejercicios.ok) return ejercicios;

  const rutinas = migrarRutinas();
  if (!rutinas.ok) return rutinas;

  // Las claves obsoletas se borran al final: si algo falla antes, siguen ahi.
  OBSOLETE_KEYS.forEach((key) => driver.remove(key));

  return { ok: true };
}

function migrarEjercicios() {
  const lectura = driver.read(KEYS.exercises);
  if (!lectura.ok) return lectura;
  if (!lectura.found) return { ok: true };
  if (!Array.isArray(lectura.value)) return { ok: false, reason: 'corrupt' };

  const migrados = lectura.value.map((ex) => {
    const grupos = [
      ...new Set(
        (Array.isArray(ex.categories) ? ex.categories : [ex.muscleGroup]).filter(isMuscleGroupId),
      ),
    ];

    // Se construye el objeto nuevo en lugar de propagar el viejo con delete: asi
    // los campos retirados no sobreviven por descuido.
    return {
      id: ex.id,
      name: ex.name,
      muscleGroupIds: grupos,
      equipmentId: isEquipmentId(ex.equipment) ? ex.equipment : null,
      sets: Array.isArray(ex.sets) ? ex.sets : [],
      createdAt: ex.createdAt,
      updatedAt: ex.updatedAt ?? ex.createdAt,
    };
  });

  return driver.write(KEYS.exercises, migrados);
}

function migrarRutinas() {
  // La clave nueva puede existir ya si una migracion anterior se quedo a medias.
  const yaMigrado = driver.read(KEYS.routines);
  if (yaMigrado.ok && yaMigrado.found) {
    driver.remove(LEGACY_KEYS.routines);
    return { ok: true };
  }

  const lectura = driver.read(LEGACY_KEYS.routines);
  if (!lectura.ok) return lectura;
  if (!lectura.found) return { ok: true };
  if (!Array.isArray(lectura.value)) return { ok: false, reason: 'corrupt' };

  const migradas = lectura.value.map((day) => ({
    id: day.id,
    name: day.name,
    colorId: routineColorIdFromValue(day.color) ?? DEFAULT_ROUTINE_COLOR_ID,
    exerciseIds: [...new Set((Array.isArray(day.exerciseIds) ? day.exerciseIds : []).filter(esId))],
    createdAt: day.createdAt,
    updatedAt: day.updatedAt ?? day.createdAt,
  }));

  const escritura = driver.write(KEYS.routines, migradas);
  if (!escritura.ok) return escritura;

  // Se comprueba que la clave nueva se puede leer ANTES de borrar la vieja. Sin
  // esta lectura, un fallo de cuota dejaria al usuario sin rutinas.
  const verificacion = driver.read(KEYS.routines);
  if (!verificacion.ok || !verificacion.found) {
    return { ok: false, reason: 'verificationFailed' };
  }

  driver.remove(LEGACY_KEYS.routines);
  return { ok: true };
}
