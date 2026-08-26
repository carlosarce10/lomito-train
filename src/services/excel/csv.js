import { isoDay, saveBlob } from '../file/downloadFile';
import { toCsvField } from '../file/sanitize';

/**
 * Exportacion a CSV, sin dependencias.
 *
 * Es el respaldo de rescate: sigue funcionando si el chunk de exceljs no se descarga,
 * que en el gimnasio y sin cobertura es un caso real, y es a lo que se recurre cuando
 * los datos estan tan corruptos que ni el modelo se puede construir.
 *
 * Exporta una hoja por clic, porque los navegadores bloquean las descargas
 * encadenadas. Ver docs/export.md.
 */

// El BOM es imprescindible: Excel en Windows asume la pagina de codigos ANSI del
// sistema al abrir un csv con doble clic, y "Maquina" se ve como "MÃ¡quina".
const BOM = '﻿';

/**
 * Delimitador y separador decimal segun el idioma.
 *
 * Van emparejados por necesidad: en un Windows con configuracion regional espanola el
 * separador de lista es el punto y coma, asi que un csv separado por comas cae entero
 * en la columna A. Y si el delimitador es punto y coma, el decimal es la coma.
 *
 * @param {string} language Idioma activo.
 * @returns {{ delimitador: string, decimal: string }}
 */
export const csvDialect = (language) =>
  language === 'es' ? { delimitador: ';', decimal: ',' } : { delimitador: ',', decimal: '.' };

/**
 * Construye y entrega un CSV.
 *
 * @param {object} params
 * @param {string[]} params.headers Cabeceras ya traducidas.
 * @param {Array<Array<string|number>>} params.rows Filas.
 * @param {string} params.filename Nombre sin extension.
 * @param {string} params.language Idioma activo.
 * @returns {Promise<{ ok: boolean, error?: Error }>}
 */
export async function exportCsv({ headers, rows, filename, language }) {
  try {
    const { delimitador, decimal } = csvDialect(language);

    // A diferencia del xlsx, en csv no hay tipos: el separador decimal SI debe
    // seguir al idioma, porque nadie va a reinterpretarlo despues.
    const celda = (valor) =>
      typeof valor === 'number'
        ? toCsvField(String(valor).replace('.', decimal))
        : toCsvField(valor);

    const contenido =
      BOM +
      [headers, ...rows].map((fila) => fila.map(celda).join(delimitador)).join('\r\n') +
      '\r\n';

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
    return await saveBlob(blob, `lomito-train_${filename}_${isoDay()}.csv`);
  } catch (error) {
    return { ok: false, error };
  }
}
