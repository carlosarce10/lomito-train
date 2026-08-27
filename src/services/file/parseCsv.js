// El apostrofo inicial es la guarda anti-formulas que el exportador antepone a los
// valores que empiezan por un caracter peligroso. Al importar hay que quitarla,
// como quedo prometido en docs/export.md cuando se escribio el exportador.
const PELIGROSOS = ['=', '+', '-', '@', '\t', '\r', '\n'];

/**
 * Analiza un CSV completo a una matriz de filas.
 *
 * El dialecto se detecta del propio archivo y no del idioma activo: el archivo pudo
 * exportarse con la aplicacion en el otro idioma. Un CSV espanol separa con punto y
 * coma y decimales con coma; uno ingles, al reves. Se cuenta que separador domina en
 * la linea de cabeceras, fuera de comillas.
 *
 * @param {string} texto Contenido crudo del archivo.
 * @returns {{ rows: string[][], delimiter: string, decimal: string }}
 */
export function parseCsv(texto) {
  // El BOM que el exportador antepone para Excel en Windows no es contenido.
  const limpio = texto.replace(/^\uFEFF/, '');

  const delimiter = detectarDelimitador(limpio);
  const decimal = delimiter === ';' ? ',' : '.';

  const rows = [];
  let fila = [];
  let campo = '';
  let entreComillas = false;

  for (let i = 0; i < limpio.length; i += 1) {
    const caracter = limpio[i];

    if (entreComillas) {
      if (caracter === '"') {
        // Comilla doblada = comilla literal; comilla sola = cierre.
        if (limpio[i + 1] === '"') {
          campo += '"';
          i += 1;
        } else {
          entreComillas = false;
        }
      } else {
        campo += caracter;
      }
    } else if (caracter === '"') {
      entreComillas = true;
    } else if (caracter === delimiter) {
      fila.push(cerrarCampo(campo));
      campo = '';
    } else if (caracter === '\n' || caracter === '\r') {
      if (caracter === '\r' && limpio[i + 1] === '\n') i += 1;
      fila.push(cerrarCampo(campo));
      campo = '';
      if (fila.length > 1 || fila[0] !== '') rows.push(fila);
      fila = [];
    } else {
      campo += caracter;
    }
  }
  if (campo !== '' || fila.length > 0) {
    fila.push(cerrarCampo(campo));
    if (fila.length > 1 || fila[0] !== '') rows.push(fila);
  }

  return { rows, delimiter, decimal };
}

/**
 * Convierte un campo numerico del CSV segun el decimal del dialecto.
 *
 * @param {string} campo Campo ya extraido.
 * @param {string} decimal Separador decimal del dialecto.
 * @returns {number|null} El numero, o null si no lo es.
 */
export function parseCsvNumber(campo, decimal) {
  const texto = String(campo ?? '').trim();
  if (texto === '') return null;
  const normalizado = decimal === ',' ? texto.replace(/\./g, '').replace(',', '.') : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

function cerrarCampo(campo) {
  // Se retira la guarda anti-formulas solo cuando protege de verdad: un apostrofo
  // que precede a un caracter peligroso. Un nombre que empieza por apostrofo
  // legitimo no pierde nada.
  if (campo.startsWith("'") && PELIGROSOS.includes(campo[1])) return campo.slice(1);
  return campo;
}

function detectarDelimitador(texto) {
  const primeraLinea = texto.slice(0, texto.indexOf('\n') === -1 ? undefined : texto.indexOf('\n'));
  let comas = 0;
  let puntosYComas = 0;
  let entreComillas = false;
  for (const caracter of primeraLinea) {
    if (caracter === '"') entreComillas = !entreComillas;
    else if (!entreComillas && caracter === ',') comas += 1;
    else if (!entreComillas && caracter === ';') puntosYComas += 1;
  }
  return puntosYComas >= comas ? ';' : ',';
}
