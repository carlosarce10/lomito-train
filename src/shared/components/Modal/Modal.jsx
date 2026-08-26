import { useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import './Modal.scss';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button className="modal__close" onClick={onClose} aria-label="Cerrar">
              <Icon path={mdiClose} size={0.85} />
            </button>
          </div>
        )}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
}
