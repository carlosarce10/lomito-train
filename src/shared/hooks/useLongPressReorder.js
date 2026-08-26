import { useCallback, useEffect, useRef, useState } from 'react';

const RETARDO = 350;
const TOLERANCIA = 8;

/**
 * Reordenar una lista arrastrando tras mantener pulsado.
 *
 * Se usan eventos de puntero y no la API de arrastrar y soltar de HTML porque esa
 * no funciona en tactil, que es donde se usa esta aplicacion.
 *
 * El retardo es lo que distingue arrastrar de desplazar la pagina: sin el, cualquier
 * intento de hacer scroll sobre una tarjeta la arrastraria. Y si el dedo se mueve
 * antes de que venza el retardo, se cancela y gana el scroll.
 *
 * Arrastrar no es accesible por si solo, asi que quien use este hook debe ofrecer
 * ademas una via por teclado. Ver docs/validation.md.
 *
 * @param {number} count Cuantos elementos hay.
 * @param {(desde: number, hasta: number) => void} onReorder
 * @returns {{ dragIndex: number|null, overIndex: number|null,
 *             getHandlers: (index: number) => object }}
 */
export default function useLongPressReorder(count, onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const temporizador = useRef(null);
  const inicio = useRef({ x: 0, y: 0 });
  const contenedores = useRef(new Map());

  const limpiar = useCallback(() => {
    if (temporizador.current) {
      window.clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  useEffect(() => limpiar, [limpiar]);

  const terminar = useCallback(() => {
    limpiar();
    setDragIndex((desde) => {
      setOverIndex((hasta) => {
        if (desde !== null && hasta !== null && desde !== hasta) onReorder(desde, hasta);
        return null;
      });
      return null;
    });
  }, [limpiar, onReorder]);

  const getHandlers = useCallback(
    (index) => ({
      ref: (nodo) => {
        if (nodo) contenedores.current.set(index, nodo);
        else contenedores.current.delete(index);
      },
      onPointerDown: (evento) => {
        // Solo el boton principal, y nunca desde un control: pulsar largo sobre el
        // boton de borrar no debe empezar a arrastrar la tarjeta.
        if (evento.button !== 0) return;
        if (evento.target.closest('button, input, a, [role="button"]')) return;

        inicio.current = { x: evento.clientX, y: evento.clientY };
        temporizador.current = window.setTimeout(() => {
          setDragIndex(index);
          setOverIndex(index);
          // Un aviso hactico deja claro que el modo cambio, que en tactil es la
          // unica senal de que ya se puede arrastrar.
          navigator.vibrate?.(10);
        }, RETARDO);
      },
      onPointerMove: (evento) => {
        if (dragIndex === null) {
          const dx = Math.abs(evento.clientX - inicio.current.x);
          const dy = Math.abs(evento.clientY - inicio.current.y);
          if (dx > TOLERANCIA || dy > TOLERANCIA) limpiar();
          return;
        }
        // Ya se esta arrastrando: se busca sobre que tarjeta esta el dedo.
        for (const [i, nodo] of contenedores.current) {
          const caja = nodo.getBoundingClientRect();
          if (evento.clientY >= caja.top && evento.clientY <= caja.bottom) {
            setOverIndex(i);
            break;
          }
        }
      },
      onPointerUp: terminar,
      onPointerCancel: () => {
        limpiar();
        setDragIndex(null);
        setOverIndex(null);
      },
      onLostPointerCapture: terminar,
    }),
    [dragIndex, limpiar, terminar],
  );

  return { dragIndex, overIndex, getHandlers, total: count };
}
