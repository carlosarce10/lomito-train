import { v4 as uuid } from 'uuid';

import { isEquipmentId, isMuscleGroupId } from '../catalogs';
import { LIMITS } from '../validation/limits';
import { normalizeText } from '../validation/normalize';
import { parseDecimal, parseInteger } from '../validation/parseDecimal';

const ahora = () => new Date().toISOString();

/**
 * Crea un ejercicio ya normalizado y acotado al catalogo.
 *
 * Corrige un defecto del codigo anterior: `equipment` se perdia al crear y solo
 * se persistia al editar, de modo que en la misma coleccion convivian dos formas
 * distintas del mismo objeto.
 *
 * @param {{ name: string, categories?: string[], muscleGroup?: string, equipment?: string }} datos
 * @returns {object} Ejercicio listo para guardar.
 */
export function createExercise({ name, categories, muscleGroup, equipment } = {}) {
  const grupos = normalizeGroups(categories, muscleGroup);
  const marca = ahora();

  return {
    id: uuid(),
    name: normalizeText(name),
    muscleGroup: grupos[0] ?? '',
    categories: grupos,
    equipment: isEquipmentId(equipment) ? equipment : '',
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

  if ('name' in cambios) siguiente.name = normalizeText(cambios.name);

  if ('categories' in cambios || 'muscleGroup' in cambios) {
    const grupos = normalizeGroups(cambios.categories, cambios.muscleGroup);
    if (grupos.length > 0) {
      siguiente.categories = grupos;
      siguiente.muscleGroup = grupos[0];
    }
  }

  if ('equipment' in cambios) {
    siguiente.equipment = isEquipmentId(cambios.equipment) ? cambios.equipment : '';
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
    siguiente.weight = Math.round(peso / LIMITS.weight.step) * LIMITS.weight.step;
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

/** Funde categories y el escalar muscleGroup en una lista valida y sin duplicados. */
function normalizeGroups(categories, muscleGroup) {
  const candidatos = Array.isArray(categories) && categories.length ? categories : [muscleGroup];
  return [...new Set(candidatos.filter(isMuscleGroupId))].slice(
    0,
    LIMITS.muscleGroupsPerExercise.max,
  );
}
