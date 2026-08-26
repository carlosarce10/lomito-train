/**
 * Entrega de archivos al usuario. Unico sitio del proyecto que crea un enlace de
 * descarga o llama a la API de compartir.
 */

const RESERVADOS = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * Convierte un texto en un nombre de archivo valido en cualquier sistema.
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
 * Fecha en ISO corto para el nombre del archivo.
 *
 * Sin localizar a proposito: asi los archivos ordenan cronologicamente en el
 * explorador en cualquier idioma.
 *
 * @param {Date} [fecha]
 * @returns {string} yyyy-mm-dd
 */
export const isoDay = (fecha = new Date()) => fecha.toISOString().slice(0, 10);

// navigator.share puede quedarse colgada para siempre: exige activacion transitoria
// del usuario, y un await previo (por ejemplo el import() del motor de PDF) la
// consume. Cuando eso pasa, en algunos navegadores la promesa ni se resuelve ni se
// rechaza, y quien la espera se queda bloqueado. Ese fue el bug del boton de PDF,
// que quedaba deshabilitado para siempre. Ver docs/export.md.
const TIEMPO_MAXIMO_COMPARTIR = 400;

/** Indica si merece la pena intentar compartir en lugar de descargar. */
function puedeCompartir(file) {
  if (!file || typeof navigator.share !== 'function') return false;
  if (!navigator.canShare?.({ files: [file] })) return false;
  // Compartir tiene sentido en un dispositivo tactil, que es donde una descarga
  // saca al usuario de la PWA. En un escritorio la descarga es lo esperado.
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

/**
 * Entrega un Blob al usuario. Comparte en movil si el navegador lo permite, y si no
 * descarga.
 *
 * En una PWA instalada un enlace de descarga puede abrir el archivo en la propia
 * ventana y sacar al usuario de la aplicacion. Compartir es ademas el flujo real:
 * mandar el PDF de la rutina a un chat, a Archivos o a la impresora del gimnasio.
 *
 * No lanza nunca y no se queda colgada nunca: devuelve el resultado para que la
 * interfaz avise. Cuando termina bien devuelve tambien el nombre entregado, que es
 * lo unico que distingue un aviso de otro cuando hay varias descargas.
 *
 * @param {Blob} blob Contenido.
 * @param {string} filename Nombre con extension.
 * @param {{ title?: string }} [opciones]
 * @returns {Promise<{ ok: boolean, via?: 'share'|'download', filename?: string, error?: Error }>}
 */
export async function saveBlob(blob, filename, { title } = {}) {
  const file = typeof File === 'function' ? new File([blob], filename, { type: blob.type }) : null;

  if (puedeCompartir(file)) {
    try {
      // Si el dialogo no aparece en el tiempo maximo, se abandona y se descarga.
      // Abandonar es seguro: si el dialogo acaba abriendose, el usuario compartira
      // y como mucho tendra ademas el archivo descargado.
      const compartido = await Promise.race([
        navigator.share({ files: [file], title: title ?? filename }).then(() => 'ok'),
        new Promise((resolver) => {
          window.setTimeout(() => resolver('timeout'), TIEMPO_MAXIMO_COMPARTIR);
        }),
      ]);
      if (compartido === 'ok') return { ok: true, via: 'share', filename };
    } catch (error) {
      // Cancelar el dialogo de compartir no es un fallo: no hay nada que avisar.
      if (error?.name === 'AbortError') return { ok: true, via: 'share', filename };
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
    return { ok: true, via: 'download', filename };
  } catch (error) {
    return { ok: false, error };
  }
}
