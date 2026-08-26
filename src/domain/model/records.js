/**
 * Calculo de la mejor marca de un ejercicio. Es un valor derivado: se calcula al
 * mostrarlo y no se persiste nunca.
 *
 * @param {Array<{ weight: number, reps: number }>} sets Series del ejercicio.
 * @returns {{ weight: number, reps: number } | null} La marca, o null si no hay.
 */
export function getRecord(sets) {
  if (!Array.isArray(sets) || sets.length === 0) return null;

  const pesoMaximo = Math.max(...sets.map((set) => set.weight));
  if (pesoMaximo <= 0) return null;

  // Con el mismo peso maximo, gana la serie de mas repeticiones.
  const mejor = sets
    .filter((set) => set.weight === pesoMaximo)
    .reduce((a, b) => (b.reps > a.reps ? b : a));

  return { weight: pesoMaximo, reps: mejor.reps };
}

/**
 * Peso maximo levantado en un ejercicio, o 0 si no hay series.
 *
 * @param {Array<{ weight: number }>} sets Series del ejercicio.
 * @returns {number}
 */
export function getMaxWeight(sets) {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  return Math.max(...sets.map((set) => set.weight));
}
