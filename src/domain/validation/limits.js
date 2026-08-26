/**
 * Limites de todo lo que escribe el usuario. Fuente unica: no se repiten en el JSX.
 * Ver docs/validation.md.
 */
export const LIMITS = {
  name: { min: 1, max: 60 },
  // El rango es en kilos, que es como se guarda siempre. No se exige un multiplo
  // concreto: el incremento util depende de la unidad que ve el usuario (0,25 kg o
  // 0,5 lb) y eso es cosa de la interfaz. Lo que el dominio fija es el rango y los
  // dos decimales, que son los que hacen estable la conversion de ida y vuelta.
  weight: { min: 0, max: 1000, decimals: 2 },
  reps: { min: 0, max: 500 },
  setsPerExercise: { max: 50 },
  exercisesPerRoutine: { max: 100 },
  muscleGroupsPerExercise: { min: 1, max: 5 },
};
