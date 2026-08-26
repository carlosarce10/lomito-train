import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Confina el foco dentro de un contenedor mientras esta activo y lo devuelve
 * al elemento que lo tenia al abrirse.
 *
 * @param {boolean} active Si false, no hace nada.
 * @returns {import('react').RefObject<HTMLElement>} Ref a colocar en el contenedor.
 */
export default function useFocusTrap(active) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const previouslyFocused = document.activeElement;

    // Lleva el foco dentro al abrir. Sustituye a autoFocus, que es un antipatron
    // de accesibilidad: aqui el foco se mueve solo porque se abrio un dialogo.
    const preferred = container.querySelector('[data-autofocus]');
    const focusables = container.querySelectorAll(FOCUSABLE);
    (preferred ?? focusables[0] ?? container).focus();

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const items = Array.from(container.querySelectorAll(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [active]);

  return containerRef;
}
