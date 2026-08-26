import { useCallback, useSyncExternalStore } from 'react';

import { createExercise, createSet, updateExercise, updateSet } from '@domain/model/exercise';
import { exercisesRepository, routinesRepository } from '@domain/storage/repositories';
import { LIMITS } from '@domain/validation/limits';

/**
 * Acceso a la coleccion de ejercicios. Solo datos: los filtros de busqueda viven
 * en useExerciseFilters, para que quien solo necesita leer no arrastre estado de
 * interfaz que no usa.
 *
 * Todos los consumidores comparten el mismo store, asi que dos componentes
 * montados a la vez no pueden divergir.
 *
 * @returns {object} Coleccion y operaciones. Cada operacion devuelve `{ ok }`.
 */
export default function useExercises() {
  const { store } = exercisesRepository;
  const exercises = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const addExercise = useCallback((datos) => {
    const nuevo = createExercise(datos);
    const resultado = exercisesRepository.update((prev) => [nuevo, ...prev]);
    return resultado.ok ? { ok: true, exercise: nuevo } : resultado;
  }, []);

  const editExercise = useCallback((id, cambios) => {
    return exercisesRepository.update((prev) =>
      prev.map((ex) => (ex.id === id ? updateExercise(ex, cambios) : ex)),
    );
  }, []);

  /**
   * Borra un ejercicio y lo quita de todas las rutinas que lo referencian.
   * Antes solo se borraba de su coleccion, y los ids huerfanos quedaban dentro de
   * las rutinas para siempre. Ver docs/data-model.md.
   */
  const deleteExercise = useCallback((id) => {
    const resultado = exercisesRepository.update((prev) => prev.filter((ex) => ex.id !== id));
    if (!resultado.ok) return resultado;

    return routinesRepository.update((prev) =>
      prev.map((routine) =>
        routine.exerciseIds.includes(id)
          ? { ...routine, exerciseIds: routine.exerciseIds.filter((x) => x !== id) }
          : routine,
      ),
    );
  }, []);

  const addSet = useCallback((exerciseId) => {
    return exercisesRepository.update((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        if (ex.sets.length >= LIMITS.setsPerExercise.max) return ex;
        return { ...ex, sets: [...ex.sets, createSet()], updatedAt: new Date().toISOString() };
      }),
    );
  }, []);

  /**
   * Cambia el peso o las repeticiones de una serie.
   * Si el valor no es valido devuelve `{ ok: false, issue }` y no guarda nada,
   * en lugar de persistir un 0 en silencio.
   */
  const editSet = useCallback((exerciseId, setId, cambios) => {
    const ejercicio = exercisesRepository.getAll().find((ex) => ex.id === exerciseId);
    const serie = ejercicio?.sets.find((s) => s.id === setId);
    if (!serie) return { ok: false, issue: 'notFound' };

    const { set, ok, issue } = updateSet(serie, cambios);
    if (!ok) return { ok: false, issue };

    return exercisesRepository.update((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? set : s)),
              updatedAt: new Date().toISOString(),
            },
      ),
    );
  }, []);

  const deleteSet = useCallback((exerciseId, setId) => {
    return exercisesRepository.update((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.filter((s) => s.id !== setId),
              updatedAt: new Date().toISOString(),
            },
      ),
    );
  }, []);

  return {
    exercises,
    addExercise,
    updateExercise: editExercise,
    deleteExercise,
    addSet,
    updateSet: editSet,
    deleteSet,
  };
}
