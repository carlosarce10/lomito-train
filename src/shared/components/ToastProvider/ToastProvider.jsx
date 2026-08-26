import { useCallback, useMemo, useRef, useState } from 'react';

import { ToastContext } from './ToastContext';

import './ToastProvider.scss';

const DURACION = 5000;

/**
 * Avisos no bloqueantes.
 *
 * Existe por la regla 7 de CLAUDE.md: ningun error silenciado. La capa de dominio ya
 * devuelve `{ ok: false, error }` cuando una escritura falla, pero hasta ahora nadie
 * lo mostraba, asi que un almacenamiento lleno seguia siendo invisible para el
 * usuario. Este es el sitio donde se ve.
 *
 * La region es aria-live="polite" y no "assertive": un aviso de guardado no debe
 * interrumpir lo que el lector de pantalla esta diciendo.
 *
 * Vive en shared y no en app porque las features lo consumen, y una feature no puede
 * importar de app sin invertir la direccion de las dependencias. Recibe el mensaje
 * ya traducido: shared no conoce el idioma.
 */
export default function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const siguienteId = useRef(0);
  // Aviso visible por mensaje, y su temporizador, para poder reiniciarlo cuando el
  // mismo mensaje se vuelve a pedir.
  const visibles = useRef(new Map());
  const temporizadores = useRef(new Map());

  const descartar = useCallback((id) => {
    window.clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
    for (const [clave, visible] of visibles.current) {
      if (visible === id) visibles.current.delete(clave);
    }
    setAvisos((prev) => prev.filter((aviso) => aviso.id !== id));
  }, []);

  const programarCierre = useCallback(
    (id) => {
      window.clearTimeout(temporizadores.current.get(id));
      temporizadores.current.set(
        id,
        window.setTimeout(() => descartar(id), DURACION),
      );
    },
    [descartar],
  );

  // Un mismo mensaje no se apila. NumberField confirma el valor en cada pulsacion,
  // asi que una escritura que falla mientras el usuario teclea pediria un aviso por
  // tecla: se reutiliza el que ya se ve y solo se reinicia su temporizador.
  const mostrar = useCallback(
    (mensaje, tono = 'error') => {
      const clave = `${tono}|${mensaje}`;
      const repetido = visibles.current.get(clave);
      if (repetido !== undefined) {
        programarCierre(repetido);
        return repetido;
      }

      const id = siguienteId.current;
      siguienteId.current += 1;
      visibles.current.set(clave, id);
      setAvisos((prev) => [...prev, { id, mensaje, tono }]);
      programarCierre(id);
      return id;
    },
    [programarCierre],
  );

  const valor = useMemo(
    () => ({
      /** Muestra un aviso de error. */
      error: (mensaje) => mostrar(mensaje, 'error'),
      /** Muestra un aviso de exito. */
      success: (mensaje) => mostrar(mensaje, 'success'),
      descartar,
    }),
    [mostrar, descartar],
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="c-toast-provider" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <button
            key={aviso.id}
            type="button"
            className={`c-toast-provider__item c-toast-provider__item--${aviso.tono}`}
            onClick={() => descartar(aviso.id)}
          >
            {aviso.mensaje}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
