import { isoDay, saveBlob } from '../file/downloadFile';
import { sanitizeCell } from '../file/sanitize';

/**
 * Exportacion de todos los datos a un libro de Excel.
 *
 * exceljs se carga con import() diferido: pesa unos 250 kB gzip. Se usa exceljs y no
 * SheetJS por cadena de suministro: la ultima version de SheetJS en npm es de 2022 y
 * arrastra dos CVE cuyas correcciones no estan en npm. Ver docs/export.md.
 */

/** Carga el motor de Excel. Se puede llamar antes del clic para precalentar la cache. */
export async function loadExcelEngine() {
  const modulo = await import('exceljs');
  return modulo.default ?? modulo;
}

/**
 * Escribe la hora de pared local en lugar del instante UTC.
 *
 * XLSX no tiene concepto de zona horaria, asi que un Date con la marca Z se ve
 * desplazado las horas del huso. La zona queda declarada en la hoja de metadatos
 * para que el desplazamiento sea reversible.
 */
function fechaLocal(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
}

/** Marca las columnas de texto como texto para que Excel no reinterprete al reabrir. */
function aplicarColumnas(hoja, columnas) {
  hoja.columns = columnas.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  hoja.getRow(1).font = { bold: true };
  hoja.views = [{ state: 'frozen', ySplit: 1 }];
  columnas.forEach((c, i) => {
    const columna = hoja.getColumn(i + 1);
    if (c.tipo === 'texto') columna.numFmt = '@';
    if (c.tipo === 'peso') columna.numFmt = '0.##';
    if (c.tipo === 'entero') columna.numFmt = '0';
    if (c.tipo === 'fecha') columna.numFmt = 'yyyy-mm-dd hh:mm';
  });
}

/**
 * Genera el libro y lo entrega al usuario.
 *
 * Los numeros se escriben crudos y sin localizar a proposito: Excel los muestra segun
 * la configuracion de quien abre el fichero. Convertirlos a texto los volveria cadenas
 * y romperia cualquier suma, grafica o tabla dinamica.
 *
 * @param {object} params
 * @param {Array} params.exercises Ejercicios.
 * @param {Array} params.routines Rutinas.
 * @param {object} params.labels Cabeceras y nombres de hoja, ya traducidos.
 * @param {(id: string) => string} params.muscleGroupLabel Traductor de grupo muscular.
 * @param {(id: string) => string} params.equipmentLabel Traductor de equipamiento.
 * @param {(id: string) => string} params.colorLabel Traductor de color de rutina.
 * @param {number} params.schemaVersion Version del esquema persistido.
 * @returns {Promise<{ ok: boolean, error?: Error }>}
 */
export async function exportWorkbook({
  exercises,
  routines,
  labels,
  muscleGroupLabel,
  equipmentLabel,
  colorLabel,
  schemaVersion,
}) {
  try {
    const ExcelJS = await loadExcelEngine();
    const libro = new ExcelJS.Workbook();
    libro.creator = 'Lomito Train';
    libro.created = new Date();

    // ── Ejercicios ──────────────────────────────────────────────────────────
    const hojaEjercicios = libro.addWorksheet(labels.sheets.exercises);
    aplicarColumnas(hojaEjercicios, [
      { header: labels.columns.id, key: 'id', width: 38, tipo: 'texto' },
      { header: labels.columns.name, key: 'name', width: 32, tipo: 'texto' },
      { header: labels.columns.muscleGroups, key: 'groups', width: 28, tipo: 'texto' },
      { header: labels.columns.equipment, key: 'equipment', width: 16, tipo: 'texto' },
      { header: labels.columns.setCount, key: 'sets', width: 10, tipo: 'entero' },
      { header: labels.columns.maxWeight, key: 'max', width: 12, tipo: 'peso' },
      { header: labels.columns.createdAt, key: 'created', width: 18, tipo: 'fecha' },
      { header: labels.columns.updatedAt, key: 'updated', width: 18, tipo: 'fecha' },
    ]);
    for (const ex of exercises) {
      hojaEjercicios.addRow({
        id: sanitizeCell(ex.id),
        name: sanitizeCell(ex.name),
        groups: sanitizeCell(ex.muscleGroupIds.map(muscleGroupLabel).join(', ')),
        equipment: sanitizeCell(ex.equipmentId ? equipmentLabel(ex.equipmentId) : ''),
        sets: ex.sets.length,
        max: ex.sets.length > 0 ? Math.max(...ex.sets.map((s) => s.weight)) : 0,
        created: fechaLocal(ex.createdAt),
        updated: fechaLocal(ex.updatedAt),
      });
    }

    // ── Rutinas ─────────────────────────────────────────────────────────────
    const hojaRutinas = libro.addWorksheet(labels.sheets.routines);
    aplicarColumnas(hojaRutinas, [
      { header: labels.columns.id, key: 'id', width: 38, tipo: 'texto' },
      { header: labels.columns.name, key: 'name', width: 32, tipo: 'texto' },
      { header: labels.columns.color, key: 'color', width: 14, tipo: 'texto' },
      { header: labels.columns.exerciseCount, key: 'count', width: 12, tipo: 'entero' },
      { header: labels.columns.createdAt, key: 'created', width: 18, tipo: 'fecha' },
      { header: labels.columns.updatedAt, key: 'updated', width: 18, tipo: 'fecha' },
    ]);
    for (const routine of routines) {
      hojaRutinas.addRow({
        id: sanitizeCell(routine.id),
        name: sanitizeCell(routine.name),
        color: sanitizeCell(colorLabel(routine.colorId)),
        count: routine.exerciseIds.length,
        created: fechaLocal(routine.createdAt),
        updated: fechaLocal(routine.updatedAt),
      });
    }

    // ── Rutina por ejercicio, para poder cruzar en una tabla dinamica ───────
    const porId = new Map(exercises.map((ex) => [ex.id, ex]));
    const hojaRelacion = libro.addWorksheet(labels.sheets.routineExercises);
    aplicarColumnas(hojaRelacion, [
      { header: labels.columns.routine, key: 'routine', width: 28, tipo: 'texto' },
      { header: labels.columns.position, key: 'position', width: 10, tipo: 'entero' },
      { header: labels.columns.exercise, key: 'exercise', width: 32, tipo: 'texto' },
      { header: labels.columns.muscleGroups, key: 'groups', width: 28, tipo: 'texto' },
    ]);
    for (const routine of routines) {
      routine.exerciseIds.forEach((id, indice) => {
        const ex = porId.get(id);
        if (!ex) return;
        hojaRelacion.addRow({
          routine: sanitizeCell(routine.name),
          position: indice + 1,
          exercise: sanitizeCell(ex.name),
          groups: sanitizeCell(ex.muscleGroupIds.map(muscleGroupLabel).join(', ')),
        });
      });
    }

    // ── Series, una fila por serie: es la hoja que sirve para graficar ──────
    const hojaSeries = libro.addWorksheet(labels.sheets.sets);
    aplicarColumnas(hojaSeries, [
      { header: labels.columns.exercise, key: 'exercise', width: 32, tipo: 'texto' },
      { header: labels.columns.position, key: 'position', width: 10, tipo: 'entero' },
      { header: labels.columns.weight, key: 'weight', width: 14, tipo: 'peso' },
      { header: labels.columns.reps, key: 'reps', width: 10, tipo: 'entero' },
      { header: labels.columns.updatedAt, key: 'updated', width: 18, tipo: 'fecha' },
    ]);
    for (const ex of exercises) {
      ex.sets.forEach((serie, indice) => {
        hojaSeries.addRow({
          exercise: sanitizeCell(ex.name),
          position: indice + 1,
          weight: serie.weight,
          reps: serie.reps,
          updated: fechaLocal(ex.updatedAt),
        });
      });
    }

    // ── Metadatos: sin esto el desplazamiento de las fechas no es reversible ─
    const hojaMeta = libro.addWorksheet(labels.sheets.metadata);
    aplicarColumnas(hojaMeta, [
      { header: labels.columns.key, key: 'k', width: 24, tipo: 'texto' },
      { header: labels.columns.value, key: 'v', width: 44, tipo: 'texto' },
    ]);
    hojaMeta.addRows([
      { k: 'app', v: 'Lomito Train' },
      { k: 'schemaVersion', v: String(schemaVersion) },
      { k: 'exportedAt', v: new Date().toISOString() },
      { k: 'timezone', v: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { k: 'exercises', v: String(exercises.length) },
      { k: 'routines', v: String(routines.length) },
    ]);

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return await saveBlob(blob, `lomito-train_datos_${isoDay()}.xlsx`);
  } catch (error) {
    return { ok: false, error };
  }
}
