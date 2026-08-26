import { useCallback, useSyncExternalStore } from 'react';

import {
  addExerciseToRoutine,
  createRoutine,
  removeExerciseFromRoutine,
  reorderRoutineExercises,
  updateRoutine,
} from '@/domain/model/routine';
import { routinesRepository } from '@/domain/storage/repositories';

/**
 * Acceso a la coleccion de rutinas. Todas las operaciones devuelven `{ ok }` para
 * que la interfaz pueda avisar si la escritura fallo.
 *
 * La carpeta y el hook se renombran a `routines` en la fase 3, junto con su clave
 * de almacenamiento y su migracion. Ver docs/plan.md.
 */
export default function useWorkoutDays() {
  const { store } = routinesRepository;
  const workoutDays = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const addWorkoutDay = useCallback((name, color) => {
    const nueva = createRoutine({ name, color });
    const resultado = routinesRepository.update((prev) => [...prev, nueva]);
    return resultado.ok ? { ok: true, routine: nueva } : resultado;
  }, []);

  const editWorkoutDay = useCallback((id, cambios) => {
    return routinesRepository.update((prev) =>
      prev.map((day) => (day.id === id ? updateRoutine(day, cambios) : day)),
    );
  }, []);

  const deleteWorkoutDay = useCallback((id) => {
    return routinesRepository.update((prev) => prev.filter((day) => day.id !== id));
  }, []);

  const addExerciseToDay = useCallback((dayId, exerciseId) => {
    return routinesRepository.update((prev) =>
      prev.map((day) => (day.id === dayId ? addExerciseToRoutine(day, exerciseId) : day)),
    );
  }, []);

  const removeExerciseFromDay = useCallback((dayId, exerciseId) => {
    return routinesRepository.update((prev) =>
      prev.map((day) => (day.id === dayId ? removeExerciseFromRoutine(day, exerciseId) : day)),
    );
  }, []);

  const reorderExercises = useCallback((dayId, from, to) => {
    return routinesRepository.update((prev) =>
      prev.map((day) => (day.id === dayId ? reorderRoutineExercises(day, from, to) : day)),
    );
  }, []);

  return {
    workoutDays,
    addWorkoutDay,
    updateWorkoutDay: editWorkoutDay,
    deleteWorkoutDay,
    addExerciseToDay,
    removeExerciseFromDay,
    reorderExercises,
  };
}
