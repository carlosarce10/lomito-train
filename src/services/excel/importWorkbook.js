import { sanitizeCell } from '../file/sanitize';

import { loadExcelEngine } from './workbook';

/**
 * Lee un libro exportado por la aplicacion y lo devuelve como datos crudos.
 *
 * El libro guarda etiquetas traducidas y enlaza las hojas por nombre, no por id:
 * la hoja de series dice "Press de banca", no un uuid. Por eso este importador
 * necesita el diccionario inverso de i18n, y por eso reconstruye las relaciones
 * emparejando nombres normalizados. Devuelve entidades con la forma del esquema;
 * validarlas y escribirlas es trabajo del dominio, no de este archivo.
 *
 * @param {File} file Archivo .xlsx elegido por el usuario.
 * @param {object} dictionary El diccionario de i18n/importDictionary.
 * @returns {Promise<{ ok: true, exercises: Array, routines: Array }
 *         | { ok: false, reason: string }>}
 */
export async function importWorkbook(file, dictionary) {
  const ExcelJS = await loadExcelEngine();
  const libro = new ExcelJS.Workbook();
  try {
    await libro.xlsx.load(await file.arrayBuffer());
  } catch {
    return { ok: false, reason: 'corrupt' };
  }

  // Las hojas se reconocen por su nombre en cualquiera de los idiomas.
  const hojas = {};
  libro.eachSheet((hoja) => {
    const tipo = dictionary.sheetKey(hoja.name);
    if (tipo) hojas[tipo] = hoja;
  });
  if (!hojas.exercises) return { ok: false, reason: 'notLomitoTrain' };

  const ejercicios = leerHoja(hojas.exercises, dictionary).map((fila) => ({
    id: uuidValido(fila.id) ? fila.id : crypto.randomUUID(),
    name: sanitizeCell(fila.name),
    muscleGroupIds: separarEtiquetas(fila.muscleGroups)
      .map((etiqueta) => dictionary.muscleGroupId(etiqueta))
      .filter(Boolean),
    equipmentId: dictionary.equipmentId(fila.equipment),
    sets: [],
    createdAt: comoIso(fila.createdAt),
    updatedAt: comoIso(fila.updatedAt ?? fila.createdAt),
  }));

  // Las series se enlazan por nombre de ejercicio, que es lo unico que la hoja trae.
  const porNombre = new Map(ejercicios.map((ex) => [claveNombre(ex.name), ex]));
  if (hojas.sets) {
    const series = leerHoja(hojas.sets, dictionary);
    series.sort((a, b) => (numero(a.position) ?? 0) - (numero(b.position) ?? 0));
    for (const fila of series) {
      const ejercicio = porNombre.get(claveNombre(fila.exercise));
      if (!ejercicio) continue;
      ejercicio.sets.push({
        id: crypto.randomUUID(),
        weight: numero(fila.weight) ?? 0,
        reps: numero(fila.reps) ?? 0,
      });
    }
  }

  const rutinas = (hojas.routines ? leerHoja(hojas.routines, dictionary) : []).map((fila) => ({
    id: uuidValido(fila.id) ? fila.id : crypto.randomUUID(),
    name: sanitizeCell(fila.name),
    colorId: dictionary.colorId(fila.color) ?? '',
    exerciseIds: [],
    createdAt: comoIso(fila.createdAt),
    updatedAt: comoIso(fila.updatedAt ?? fila.createdAt),
  }));

  if (hojas.routineExercises) {
    const rutinaPorNombre = new Map(rutinas.map((r) => [claveNombre(r.name), r]));
    const relaciones = leerHoja(hojas.routineExercises, dictionary);
    relaciones.sort((a, b) => (numero(a.position) ?? 0) - (numero(b.position) ?? 0));
    for (const fila of relaciones) {
      const rutina = rutinaPorNombre.get(claveNombre(fila.routine));
      const ejercicio = porNombre.get(claveNombre(fila.exercise));
      if (rutina && ejercicio) rutina.exerciseIds.push(ejercicio.id);
    }
  }

  return { ok: true, exercises: ejercicios, routines: rutinas };
}

/** Lee una hoja a objetos, resolviendo las cabeceras con el diccionario. */
function leerHoja(hoja, dictionary) {
  const columnas = [];
  hoja.getRow(1).eachCell({ includeEmpty: true }, (celda, indice) => {
    columnas[indice] = dictionary.columnKey(comoTexto(celda.value));
  });

  const filas = [];
  hoja.eachRow((fila, numeroFila) => {
    if (numeroFila === 1) return;
    const objeto = {};
    fila.eachCell({ includeEmpty: true }, (celda, indice) => {
      const clave = columnas[indice];
      if (clave) objeto[clave] = celda.value;
    });
    if (Object.keys(objeto).length > 0) filas.push(objeto);
  });
  return filas;
}

/** Texto plano de una celda de exceljs, que puede venir como objeto enriquecido. */
function comoTexto(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'object')
    return valor.richText?.map((t) => t.text).join('') ?? valor.text ?? String(valor);
  return String(valor);
}

function numero(valor) {
  const n = typeof valor === 'number' ? valor : Number(comoTexto(valor));
  return Number.isFinite(n) ? n : null;
}

function comoIso(valor) {
  const fecha = valor instanceof Date ? valor : new Date(comoTexto(valor));
  return Number.isNaN(fecha.getTime()) ? new Date().toISOString() : fecha.toISOString();
}

const uuidValido = (valor) =>
  typeof comoTexto(valor) === 'string' && /^[0-9a-f-]{36}$/i.test(comoTexto(valor));

// El Excel une los grupos con coma y el CSV con barra: se admiten los dos.
const separarEtiquetas = (valor) =>
  comoTexto(valor)
    .split(/[,/|]/)
    .map((t) => t.trim())
    .filter(Boolean);

const claveNombre = (nombre) =>
  String(nombre ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
