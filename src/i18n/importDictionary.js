import catalogEn from './locales/en/catalog.json';
import settingsEn from './locales/en/settings.json';
import catalogEs from './locales/es/catalog.json';
import settingsEs from './locales/es/settings.json';

/**
 * Diccionario inverso para importar archivos exportados.
 *
 * El Excel y el CSV se exportan con etiquetas traducidas, no con ids: la hoja se
 * llama "Ejercicios" o "Exercises" segun el idioma activo al exportar, y un grupo
 * muscular sale como "Tren superior" o "Upper body". Importar exige el camino
 * inverso, y tiene que funcionar sin importar en que idioma se exporto ni en cual
 * esta la aplicacion ahora, asi que se indexan las etiquetas de TODOS los idiomas
 * a la vez.
 *
 * Vive en i18n porque es conocimiento de las traducciones; los servicios lo
 * reciben ya construido y no conocen los catalogos.
 */

// Normalizador propio y minimo: sin acentos, sin mayusculas, sin espacios dobles.
// Se repite aqui a proposito en lugar de importarlo del dominio, para que i18n no
// dependa de ninguna otra capa.
const clave = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const IDIOMAS = [
  { catalog: catalogEs, settings: settingsEs },
  { catalog: catalogEn, settings: settingsEn },
];

function invertir(seccion) {
  const mapa = new Map();
  for (const { catalog } of IDIOMAS) {
    for (const [id, etiqueta] of Object.entries(catalog[seccion] ?? {})) {
      mapa.set(clave(etiqueta), id);
      // El propio id tambien vale como entrada: hace el importador tolerante a un
      // archivo editado a mano que use ids en lugar de etiquetas.
      mapa.set(clave(id), id);
    }
  }
  return mapa;
}

const GRUPOS = invertir('muscleGroups');
const EQUIPAMIENTO = invertir('equipment');
const COLORES = invertir('colors');

function invertirExport(seccion) {
  const mapa = new Map();
  for (const { settings } of IDIOMAS) {
    for (const [id, etiqueta] of Object.entries(settings.export[seccion] ?? {})) {
      mapa.set(clave(etiqueta), id);
    }
  }
  return mapa;
}

const HOJAS = invertirExport('sheets');
const COLUMNAS = invertirExport('columns');

/**
 * Construye el diccionario que consumen los importadores.
 *
 * @returns {{ sheetKey: Function, columnKey: Function, muscleGroupId: Function,
 *             equipmentId: Function, colorId: Function }} Cada funcion devuelve el
 *   id canonico, o null si la etiqueta no se reconoce.
 */
export function buildImportDictionary() {
  const buscar = (mapa) => (etiqueta) => mapa.get(clave(etiqueta)) ?? null;
  return {
    sheetKey: buscar(HOJAS),
    columnKey: buscar(COLUMNAS),
    muscleGroupId: buscar(GRUPOS),
    equipmentId: buscar(EQUIPAMIENTO),
    colorId: buscar(COLORES),
  };
}
