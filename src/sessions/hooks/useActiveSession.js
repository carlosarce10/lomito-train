import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '../../shared/hooks/useLocalStorage';

const KEY = 'lomito-train-active-session';

export default function useActiveSession() {
  const [session, setSession] = useLocalStorage(KEY, null);

  const startSession = useCallback((workoutDay, allExercises) => {
    const dayExercises = workoutDay.exerciseIds
      .map((id) => allExercises.find((ex) => ex.id === id))
      .filter(Boolean);

    const newSession = {
      id: uuidv4(),
      workoutDayId: workoutDay.id,
      workoutDayName: workoutDay.name,
      workoutDayColor: workoutDay.color,
      startedAt: new Date().toISOString(),
      exercises: dayExercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        // Pre-populate with last logged sets as reference, or one empty set
        sets: ex.sets.length > 0
          ? ex.sets.map((s) => ({ id: uuidv4(), weight: s.weight, reps: s.reps, done: false }))
          : [{ id: uuidv4(), weight: 0, reps: 0, done: false }],
      })),
    };

    setSession(newSession);
    return newSession;
  }, [setSession]);

  const updateSet = useCallback((exerciseId, setId, updates) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
        };
      }),
    }));
  }, [setSession]);

  const addSet = useCallback((exerciseId) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { id: uuidv4(), weight: last?.weight ?? 0, reps: last?.reps ?? 0, done: false },
          ],
        };
      }),
    }));
  }, [setSession]);

  const deleteSet = useCallback((exerciseId, setId) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      }),
    }));
  }, [setSession]);

  const finishSession = useCallback(() => {
    const completed = { ...session, endedAt: new Date().toISOString() };
    setSession(null);
    return completed;
  }, [session, setSession]);

  const cancelSession = useCallback(() => {
    setSession(null);
  }, [setSession]);

  return {
    session,
    startSession,
    updateSet,
    addSet,
    deleteSet,
    finishSession,
    cancelSession,
  };
}
