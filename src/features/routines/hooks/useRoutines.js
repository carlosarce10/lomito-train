import { useCallback, useSyncExternalStore } from 'react';

import * as model from '@domain/model/routine';
import { routinesRepository } from '@domain/storage/repositories';

/**
 * Acceso a la coleccion de rutinas. Todas las operaciones devuelven `{ ok }` para
 * que la interfaz pueda avisar si la escritura fallo.
 *
 * Las funciones del dominio se importan con el namespace `model` a proposito: sin
 * el, los callbacks de este hook se llamarian igual que ellas y se invocarian a si
 * mismos.
 */
export default function useRoutines() {
  const { store } = routinesRepository;
  const routines = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const addRoutine = useCallback((datos) => {
    const nueva = model.createRoutine(datos);
    const resultado = routinesRepository.update((prev) => [...prev, nueva]);
    return resultado.ok ? { ok: true, routine: nueva } : resultado;
  }, []);

  const updateRoutine = useCallback((id, cambios) => {
    return routinesRepository.update((prev) =>
      prev.map((routine) => (routine.id === id ? model.updateRoutine(routine, cambios) : routine)),
    );
  }, []);

  const deleteRoutine = useCallback((id) => {
    return routinesRepository.update((prev) => prev.filter((routine) => routine.id !== id));
  }, []);

  const addExerciseToRoutine = useCallback((routineId, exerciseId) => {
    return routinesRepository.update((prev) =>
      prev.map((routine) =>
        routine.id === routineId ? model.addExerciseToRoutine(routine, exerciseId) : routine,
      ),
    );
  }, []);

  const removeExerciseFromRoutine = useCallback((routineId, exerciseId) => {
    return routinesRepository.update((prev) =>
      prev.map((routine) =>
        routine.id === routineId ? model.removeExerciseFromRoutine(routine, exerciseId) : routine,
      ),
    );
  }, []);

  const reorderExercises = useCallback((routineId, from, to) => {
    return routinesRepository.update((prev) =>
      prev.map((routine) =>
        routine.id === routineId ? model.reorderRoutineExercises(routine, from, to) : routine,
      ),
    );
  }, []);

  return {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    reorderExercises,
  };
}
