import { useEffect } from 'react';

/**
 * Ejecuta un callback cuando se pulsa Escape, mientras esta activo.
 *
 * @param {boolean} active Si false, no registra ningun listener.
 * @param {() => void} onEscape Callback a ejecutar.
 */
export default function useOnEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}
