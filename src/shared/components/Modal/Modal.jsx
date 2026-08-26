import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useId } from 'react';

import useFocusTrap from '@shared/hooks/useFocusTrap';
import useOnEscape from '@shared/hooks/useOnEscape';

import './Modal.scss';

/**
 * Dialogo modal accesible: bloquea el scroll de fondo, se cierra con Escape o
 * pulsando fuera, confina el foco y lo devuelve al cerrarse.
 *
 * @param {object} props
 * @param {boolean} props.isOpen Si false, no renderiza nada.
 * @param {() => void} props.onClose Se invoca al cerrar por cualquier via.
 * @param {string} [props.title] Titulo visible; tambien nombra el dialogo.
 * @param {string} [props.closeLabel] Texto accesible del boton de cierre.
 * @param {import('react').ReactNode} props.children Contenido del dialogo.
 */
export default function Modal({ isOpen, onClose, title, closeLabel = 'Cerrar', children }) {
  const titleId = useId();
  const containerRef = useFocusTrap(isOpen);

  useOnEscape(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal">
      {/* Boton real, no un div con onClick: asi el cierre por fondo es accesible. */}
      <button type="button" className="modal__backdrop" aria-label={closeLabel} onClick={onClose} />
      <div
        ref={containerRef}
        className="modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : closeLabel}
        tabIndex={-1}
      >
        {title && (
          <div className="modal__header">
            <h2 className="modal__title" id={titleId}>
              {title}
            </h2>
            <button className="modal__close" onClick={onClose} aria-label={closeLabel}>
              <Icon path={mdiClose} size={0.85} />
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
