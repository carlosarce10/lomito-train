import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import useLocalStorage from '../../shared/hooks/useLocalStorage';
import { DEFAULT_COLOR } from '../constants/workoutDayColors';

export default function useWorkoutDays() {
  const [workoutDays, setWorkoutDays] = useLocalStorage('lomito-train-workout-days', []);

  const addWorkoutDay = useCallback(
    (name, color = DEFAULT_COLOR) => {
      const newDay = {
        id: uuidv4(),
        name,
        color,
        exerciseIds: [],
        createdAt: new Date().toISOString(),
      };
      setWorkoutDays((prev) => [...prev, newDay]);
      return newDay;
    },
    [setWorkoutDays],
  );

  const updateWorkoutDay = useCallback(
    (id, updates) => {
      setWorkoutDays((prev) => prev.map((day) => (day.id === id ? { ...day, ...updates } : day)));
    },
    [setWorkoutDays],
  );

  const deleteWorkoutDay = useCallback(
    (id) => {
      setWorkoutDays((prev) => prev.filter((day) => day.id !== id));
    },
    [setWorkoutDays],
  );

  const addExerciseToDay = useCallback(
    (dayId, exerciseId) => {
      setWorkoutDays((prev) =>
        prev.map((day) => {
          if (day.id !== dayId) return day;
          if (day.exerciseIds.includes(exerciseId)) return day;
          return { ...day, exerciseIds: [...day.exerciseIds, exerciseId] };
        }),
      );
    },
    [setWorkoutDays],
  );

  const removeExerciseFromDay = useCallback(
    (dayId, exerciseId) => {
      setWorkoutDays((prev) =>
        prev.map((day) => {
          if (day.id !== dayId) return day;
          return { ...day, exerciseIds: day.exerciseIds.filter((id) => id !== exerciseId) };
        }),
      );
    },
    [setWorkoutDays],
  );

  const reorderExercises = useCallback(
    (dayId, fromIndex, toIndex) => {
      setWorkoutDays((prev) =>
        prev.map((day) => {
          if (day.id !== dayId) return day;
          const ids = [...day.exerciseIds];
          const [moved] = ids.splice(fromIndex, 1);
          ids.splice(toIndex, 0, moved);
          return { ...day, exerciseIds: ids };
        }),
      );
    },
    [setWorkoutDays],
  );

  return {
    workoutDays,
    addWorkoutDay,
    updateWorkoutDay,
    deleteWorkoutDay,
    addExerciseToDay,
    removeExerciseFromDay,
    reorderExercises,
  };
}
