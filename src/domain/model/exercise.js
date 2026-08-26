import { v4 as uuid } from 'uuid';

import { isEquipmentId, isMuscleGroupId } from '../catalogs';
import { LIMITS } from '../validation/limits';
import { normalizeText } from '../validation/normalize';
import { parseDecimal, parseInteger } from '../validation/parseDecimal';

const ahora = () => new Date().toISOString();

/**
 * Crea un ejercicio ya normalizado y acotado al catalogo.
 *
 * @param {{ name: string, muscleGroupIds?: string[], equipmentId?: string|null }} datos
 * @returns {object} Ejercicio listo para guardar.
 */
export function createExercise({ name, muscleGroupIds, equipmentId } = {}) {
  const marca = ahora();
  return {
    id: uuid(),
    name: normalizeText(name),
    muscleGroupIds: normalizeGroups(muscleGroupIds),
    equipmentId: isEquipmentId(equipmentId) ? equipmentId : null,
    sets: [],
    createdAt: marca,
    updatedAt: marca,
  };
}

/**
 * Aplica cambios a un ejercicio, normalizando lo que toca y refrescando updatedAt.
 *
 * @param {object} exercise Ejercicio existente.
 * @param {object} cambios Campos a modificar.
 * @returns {object} Ejercicio nuevo. El original no se muta.
 */
export function updateExercise(exercise, cambios) {
  const siguiente = { ...exercise, updatedAt: ahora() };

  if ('name' in cambios) {
    const nombre = normalizeText(cambios.name);
    if (nombre.length >= LIMITS.name.min) siguiente.name = nombre;
  }

  if ('muscleGroupIds' in cambios) {
    const grupos = normalizeGroups(cambios.muscleGroupIds);
    if (grupos.length >= LIMITS.muscleGroupsPerExercise.min) siguiente.muscleGroupIds = grupos;
  }

  if ('equipmentId' in cambios) {
    siguiente.equipmentId = isEquipmentId(cambios.equipmentId) ? cambios.equipmentId : null;
  }

  return siguiente;
}

/** Crea una serie vacia. */
export function createSet() {
  return { id: uuid(), weight: 0, reps: 0 };
}

/**
 * Aplica un cambio de peso o repeticiones a una serie, validando el valor.
 *
 * Devuelve la serie sin tocar cuando el valor no es valido, en lugar de guardar 0:
 * escribir "22,5" en un teclado espanol persistia 0 mientras la pantalla seguia
 * mostrando 22,5. Ver docs/validation.md.
 *
 * @param {object} set Serie existente.
 * @param {{ weight?: unknown, reps?: unknown }} cambios Valores crudos del input.
 * @returns {{ set: object, ok: boolean, issue?: string }}
 */
export function updateSet(set, cambios) {
  const siguiente = { ...set };

  if ('weight' in cambios) {
    const peso = parseDecimal(cambios.weight);
    if (peso === null) return { set, ok: false, issue: 'notANumber' };
    if (peso < LIMITS.weight.min || peso > LIMITS.weight.max) {
      return { set, ok: false, issue: 'outOfRange' };
    }
    const factor = 10 ** LIMITS.weight.decimals;
    siguiente.weight = Math.round(peso * factor) / factor;
  }

  if ('reps' in cambios) {
    const reps = parseInteger(cambios.reps);
    if (reps === null) return { set, ok: false, issue: 'notInteger' };
    if (reps < LIMITS.reps.min || reps > LIMITS.reps.max) {
      return { set, ok: false, issue: 'outOfRange' };
    }
    siguiente.reps = reps;
  }

  return { set: siguiente, ok: true };
}

/** Grupo muscular principal: el primero. Es derivado y no se persiste. */
export const getPrimaryMuscleGroup = (exercise) => exercise.muscleGroupIds[0] ?? null;

/** Deja una lista de grupos valida, sin duplicados y acotada. */
function normalizeGroups(ids) {
  return [...new Set((Array.isArray(ids) ? ids : []).filter(isMuscleGroupId))].slice(
    0,
    LIMITS.muscleGroupsPerExercise.max,
  );
}
