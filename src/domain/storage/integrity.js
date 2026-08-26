import { toComparableText } from '../validation/normalize';

/**
 * Comprobaciones que cruzan dos colecciones y que por eso no caben en un esquema.
 */

/**
 * Quita de las rutinas los ids de ejercicio que ya no existen, y los duplicados.
 *
 * Borrar un ejercicio no tocaba las rutinas que lo referenciaban, asi que
 * `exerciseIds` acumulaba basura indefinidamente. La interfaz lo ocultaba con un
 * filter repetido en cada componente, de modo que el usuario nunca lo limpiaba.
 *
 * @param {Array} routines Rutinas tal como estan guardadas.
 * @param {Array} exercises Ejercicios existentes.
 * @returns {{ routines: Array, removed: number }} Rutinas saneadas y cuantos ids se quitaron.
 */
export function pruneOrphanExerciseIds(routines, exercises) {
  const existentes = new Set(exercises.map((ex) => ex.id));
  let removed = 0;

  const saneadas = routines.map((routine) => {
    const vistos = new Set();
    const limpios = routine.exerciseIds.filter((id) => {
      if (!existentes.has(id) || vistos.has(id)) {
        removed += 1;
        return false;
      }
      vistos.add(id);
      return true;
    });

    return limpios.length === routine.exerciseIds.length
      ? routine
      : { ...routine, exerciseIds: limpios };
  });

  return { routines: saneadas, removed };
}

/**
 * Indica si ya existe otra entidad con el mismo nombre, ignorando acentos,
 * mayusculas y espacios repetidos.
 *
 * @param {Array<{ id: string, name: string }>} items Coleccion a revisar.
 * @param {string} name Nombre propuesto.
 * @param {string} [ignoreId] Id a excluir, al renombrar una entidad existente.
 * @returns {boolean}
 */
export function isDuplicateName(items, name, ignoreId = null) {
  const objetivo = toComparableText(name);
  if (objetivo === '') return false;
  return items.some((item) => item.id !== ignoreId && toComparableText(item.name) === objetivo);
}
