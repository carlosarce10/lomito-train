import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useId, useRef } from 'react';

import useFocusTrap from '@shared/hooks/useFocusTrap';
import useOnEscape from '@shared/hooks/useOnEscape';

import './Modal.scss';

/**
 * Dialogo modal accesible: bloquea el scroll de fondo, se cierra con Escape, con
 * Atras del navegador o pulsando fuera, confina el foco y lo devuelve al cerrarse.
 *
 * @param {object} props
 * @param {boolean} props.isOpen Si false, no renderiza nada.
 * @param {() => void} props.onClose Se invoca al cerrar por cualquier via.
 * @param {string} [props.title] Nombre del dialogo. Sin titleId, tambien se pinta en el encabezado.
 * @param {string} [props.titleId] Id del titulo que pinta el propio contenido: el dialogo se nombra con aria-labelledby y Modal no repite el encabezado.
 * @param {string} [props.closeLabel] Texto accesible del boton de cierre.
 * @param {import('react').ReactNode} props.children Contenido del dialogo.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  titleId,
  closeLabel = 'Cerrar',
  children,
}) {
  const ownTitleId = useId();
  const historyId = useId();
  const containerRef = useFocusTrap(isOpen);
  const backdropRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // El efecto del historial no puede reengancharse en cada render solo porque el
  // padre pase una funcion nueva: empujaria una entrada por render. El callback
  // viaja por una ref y el efecto depende unicamente de isOpen.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useOnEscape(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // En una PWA en Android, Atras es el gesto con el que se descarta una hoja. Sin
  // esta entrada de historial, Atras navegaba por debajo del modal y lo dejaba
  // abierto con el scroll del body bloqueado.
  useEffect(() => {
    if (!isOpen) return undefined;

    // Se conserva el estado que ya hubiera (el enrutador guarda el suyo ahi) y se
    // marca la entrada con un id propio de esta instancia, para que un modal
    // anidado no retire la entrada de otro.
    window.history.pushState({ ...window.history.state, lomitoModal: historyId }, '');

    const handlePopState = () => onCloseRef.current();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Si el cierre vino de Atras, la entrada ya se consumio y la marca no esta:
      // solo se retira cuando sigue en la pila, tras cerrar con Escape o con el
      // boton. Asi no queda una entrada huerfana que obligue a pulsar Atras dos
      // veces para salir de la pantalla.
      if (window.history.state?.lomitoModal === historyId) window.history.back();
    };
  }, [isOpen, historyId]);

  if (!isOpen) return null;

  // Cuando el contenido pinta su propio titulo, Modal no repite el encabezado.
  const paintsHeader = Boolean(title) && !titleId;

  // El nombre del dialogo sale siempre de su titulo. Antes, si no habia title, caia
  // en aria-label={closeLabel} y el lector anunciaba "Cerrar, dialogo".
  const labelledBy = titleId ?? (paintsHeader ? ownTitleId : undefined);
  // Respaldo cuando el titulo lo pinta el contenido: aria-labelledby manda si el id
  // resuelve, y si no el dialogo conserva un nombre en vez de quedarse sin ninguno.
  const label = titleId ? title : undefined;

  // El fondo es un hermano decorativo, asi que el clic se escucha en el contenedor
  // exterior y solo cierra si el evento nacio en el fondo: un clic dentro del
  // dialogo tambien burbujea hasta aqui.
  const handleClick = (event) => {
    if (event.target === backdropRef.current) onClose();
  };

  return (
    <div className="c-modal" role="presentation" onClick={handleClick}>
      {/* Div y no <button>: un boton a pantalla completa colocado antes del
          dialogo anadia una parada de tabulacion y se anunciaba como "Cerrar".
          El cierre por teclado lo cubre Escape. */}
      <div ref={backdropRef} className="c-modal__backdrop" aria-hidden="true" />
      <div
        ref={containerRef}
        className="c-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        tabIndex={-1}
      >
        {paintsHeader && (
          <div className="c-modal__header">
            <h2 className="c-modal__title" id={ownTitleId}>
              {title}
            </h2>
            <button className="c-modal__close" onClick={onClose} aria-label={closeLabel}>
              <Icon path={mdiClose} size={0.85} />
            </button>
          </div>
        )}
        <div className="c-modal__body">{children}</div>
      </div>
    </div>
  );
}
