/**
 * Limites de todo lo que escribe el usuario. Fuente unica: no se repiten en el JSX.
 * Ver docs/validation.md.
 */
export const LIMITS = {
  name: { min: 1, max: 60 },
  weight: { min: 0, max: 1000, step: 0.25 },
  reps: { min: 0, max: 500 },
  setsPerExercise: { max: 50 },
  exercisesPerRoutine: { max: 100 },
  muscleGroupsPerExercise: { min: 1, max: 5 },
};
