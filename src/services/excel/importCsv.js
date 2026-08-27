import { v4 as uuid } from 'uuid';

import { parseCsv, parseCsvNumber } from '../file/parseCsv';
import { sanitizeCell } from '../file/sanitize';

/**
 * Lee el CSV de series exportado por la aplicacion y lo devuelve como ejercicios.
 *
 * El CSV solo contiene series, una fila por serie, asi que de aqui salen ejercicios
 * con sus series y grupos musculares, y nada mas: las rutinas no viajan en este
 * formato. Validar y escribir es trabajo del dominio.
 *
 * @param {string} texto Contenido del archivo.
 * @param {object} dictionary El diccionario de i18n/importDictionary.
 * @returns {{ ok: true, exercises: Array } | { ok: false, reason: string }}
 */
export function importCsv(texto, dictionary) {
  const { rows, decimal } = parseCsv(texto);
  if (rows.length < 2) return { ok: false, reason: 'corrupt' };

  const columnas = rows[0].map((cabecera) => dictionary.columnKey(cabecera));
  if (!columnas.includes('exercise')) return { ok: false, reason: 'notLomitoTrain' };

  const ejercicios = new Map();
  const marca = new Date().toISOString();

  for (const fila of rows.slice(1)) {
    const dato = {};
    columnas.forEach((clave, indice) => {
      if (clave) dato[clave] = fila[indice];
    });

    const nombre = sanitizeCell(dato.exercise);
    if (!nombre) continue;

    if (!ejercicios.has(nombre)) {
      ejercicios.set(nombre, {
        id: uuid(),
        name: nombre,
        muscleGroupIds: String(dato.muscleGroups ?? '')
          .split(/[,/|]/)
          .map((etiqueta) => dictionary.muscleGroupId(etiqueta.trim()))
          .filter(Boolean),
        equipmentId: null,
        sets: [],
        createdAt: marca,
        updatedAt: marca,
      });
    }

    const peso = parseCsvNumber(dato.weight, decimal);
    const reps = parseCsvNumber(dato.reps, decimal);
    if (peso !== null || reps !== null) {
      ejercicios.get(nombre).sets.push({
        id: uuid(),
        weight: peso ?? 0,
        reps: reps ?? 0,
      });
    }
  }

  return { ok: true, exercises: [...ejercicios.values()] };
}
