/**
 * Entrega de ficheros al usuario. Unico sitio del proyecto que crea un enlace de
 * descarga o llama a la API de compartir.
 */

const RESERVADOS = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * Convierte un texto en un nombre de fichero valido en cualquier sistema.
 *
 * Quita acentos, rechaza los caracteres prohibidos en Windows y los nombres
 * reservados del sistema, y recorta. Ver docs/export.md.
 *
 * @param {string} texto Texto de origen, normalmente el nombre de una rutina.
 * @param {string} [respaldo] Nombre a usar si el resultado queda vacio.
 * @returns {string}
 */
export function slugifyFilename(texto, respaldo = 'export') {
  const slug = String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  if (slug === '' || RESERVADOS.test(slug)) return respaldo;
  return slug;
}

/**
 * Fecha en ISO corto para el nombre del fichero.
 *
 * Sin localizar a proposito: asi los ficheros ordenan cronologicamente en el
 * explorador en cualquier idioma.
 *
 * @param {Date} [fecha]
 * @returns {string} yyyy-mm-dd
 */
export const isoDay = (fecha = new Date()) => fecha.toISOString().slice(0, 10);

/**
 * Entrega un Blob al usuario. Comparte en movil si el navegador lo permite, y si no
 * descarga.
 *
 * En una PWA instalada un enlace de descarga puede abrir el fichero en la propia
 * ventana y sacar al usuario de la aplicacion. Compartir es ademas el flujo real:
 * mandar el PDF de la rutina a un chat, a Archivos o a la impresora del gimnasio.
 *
 * No lanza nunca: devuelve el resultado para que la interfaz avise.
 *
 * @param {Blob} blob Contenido.
 * @param {string} filename Nombre con extension.
 * @param {{ title?: string }} [opciones]
 * @returns {Promise<{ ok: boolean, via?: 'share'|'download', error?: Error }>}
 */
export async function saveBlob(blob, filename, { title } = {}) {
  const file = typeof File === 'function' ? new File([blob], filename, { type: blob.type }) : null;

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: title ?? filename });
      return { ok: true, via: 'share' };
    } catch (error) {
      // Cancelar el dialogo de compartir no es un fallo: no hay nada que avisar.
      if (error?.name === 'AbortError') return { ok: true, via: 'share' };
      // Cualquier otro fallo cae a la descarga clasica.
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = filename;
    enlace.rel = 'noopener';
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    // Revocar de forma sincrona cancela la descarga en algunos navegadores.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return { ok: true, via: 'download' };
  } catch (error) {
    return { ok: false, error };
  }
}
