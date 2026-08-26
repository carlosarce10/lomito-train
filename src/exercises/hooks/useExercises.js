import { useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import useLocalStorage from '@shared/hooks/useLocalStorage';
import useSearch from '@shared/hooks/useSearch';

const getSearchText = (ex) => ex.name;

export default function useExercises() {
  const [exercises, setExercises] = useLocalStorage('lomito-train-exercises', []);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categoryFiltered = useMemo(() => {
    if (!activeFilter) return exercises;
    return exercises.filter(
      (ex) => ex.muscleGroup === activeFilter || ex.categories?.includes(activeFilter),
    );
  }, [exercises, activeFilter]);

  const filteredExercises = useSearch(categoryFiltered, searchTerm, getSearchText);

  const addExercise = useCallback(
    (name, muscleGroup, categories = null) => {
      const cats = categories ?? (muscleGroup ? [muscleGroup] : []);
      const newExercise = {
        id: uuidv4(),
        name,
        muscleGroup: cats[0] ?? muscleGroup ?? '',
        categories: cats,
        sets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setExercises((prev) => [newExercise, ...prev]);
      return newExercise;
    },
    [setExercises],
  );

  const updateExercise = useCallback(
    (id, updates) => {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === id ? { ...ex, ...updates, updatedAt: new Date().toISOString() } : ex,
        ),
      );
    },
    [setExercises],
  );

  const deleteExercise = useCallback(
    (id) => {
      setExercises((prev) => prev.filter((ex) => ex.id !== id));
    },
    [setExercises],
  );

  const addSet = useCallback(
    (exerciseId) => {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          const newSet = { id: uuidv4(), weight: 0, reps: 0 };
          return {
            ...ex,
            sets: [...ex.sets, newSet],
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [setExercises],
  );

  const updateSet = useCallback(
    (exerciseId, setId, updates) => {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [setExercises],
  );

  const deleteSet = useCallback(
    (exerciseId, setId) => {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.filter((s) => s.id !== setId),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [setExercises],
  );

  return {
    exercises: filteredExercises,
    allExercises: exercises,
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  };
}
