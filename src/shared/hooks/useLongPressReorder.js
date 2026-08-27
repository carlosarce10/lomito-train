import { useCallback, useEffect, useRef, useState } from 'react';

const RETARDO = 350;
const TOLERANCIA = 8;

/**
 * Reordenar una lista arrastrando tras mantener pulsado.
 *
 * Se usan eventos de puntero y no la API de arrastrar y soltar de HTML porque esa
 * no funciona en tactil, que es donde se usa esta aplicacion.
 *
 * El retardo es lo que distingue arrastrar de desplazar la pagina: si el dedo se
 * mueve antes de que venza, se cancela y gana el scroll. Y al activarse hacen falta
 * dos cosas mas, las dos por el mismo motivo: el navegador mata el gesto si decide
 * que es un scroll. Se captura el puntero para seguir recibiendo el movimiento
 * aunque el dedo salga de la tarjeta, y se bloquea el scroll con un listener
 * touchmove nativo y no pasivo, porque React registra touchmove como pasivo y su
 * preventDefault no hace nada.
 *
 * @param {number} count Cuantos elementos hay.
 * @param {(desde: number, hasta: number) => void} onReorder
 * @returns {{ dragIndex: number|null, overIndex: number|null, dragOffset: number,
 *             getHandlers: (index: number) => object }}
 */
export default function useLongPressReorder(count, onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const temporizador = useRef(null);
  const inicio = useRef({ x: 0, y: 0 });
  const contenedores = useRef(new Map());
  // Refs espejo del estado. Dos motivos: los listeners nativos no se re-registran
  // por render y leerian un estado congelado, y el resultado del gesto no puede
  // decidirse dentro de un updater de estado, porque un updater debe ser puro y
  // React puede invocarlo dos veces; con onReorder dentro, StrictMode reordenaba
  // dos veces y la lista acababa en un orden que nadie pidio. Verificado.
  const arrastrando = useRef(false);
  const indices = useRef({ desde: null, hasta: null });
  // Centros verticales de todas las tarjetas, capturados al activar el arrastre.
  // El destino no puede calcularse contra las cajas en vivo: la tarjeta arrastrada
  // se traslada con el dedo, asi que su propia caja siempre contendria el puntero y
  // el destino seria siempre ella misma.
  const centros = useRef(new Map());
  // Desplazamiento vertical de la tarjeta activa respecto al punto de pulsacion.
  // Es lo que hace que la tarjeta siga al dedo en lugar de quedarse quieta.
  const [dragOffset, setDragOffset] = useState(0);

  const limpiarTemporizador = useCallback(() => {
    if (temporizador.current) {
      window.clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  useEffect(() => limpiarTemporizador, [limpiarTemporizador]);

  // Mientras se arrastra, el scroll de la pagina se bloquea desde aqui. El listener
  // vive en document para cubrir tambien el hueco entre tarjetas.
  useEffect(() => {
    const bloquear = (evento) => {
      if (arrastrando.current) evento.preventDefault();
    };
    document.addEventListener('touchmove', bloquear, { passive: false });
    return () => document.removeEventListener('touchmove', bloquear);
  }, []);

  const terminar = useCallback(() => {
    limpiarTemporizador();
    if (!arrastrando.current) return;
    arrastrando.current = false;

    const { desde, hasta } = indices.current;
    indices.current = { desde: null, hasta: null };
    setDragIndex(null);
    setOverIndex(null);
    setDragOffset(0);
    if (desde !== null && hasta !== null && desde !== hasta) onReorder(desde, hasta);
  }, [limpiarTemporizador, onReorder]);

  const getHandlers = useCallback(
    (index) => ({
      ref: (nodo) => {
        if (nodo) contenedores.current.set(index, nodo);
        else contenedores.current.delete(index);
      },
      onPointerDown: (evento) => {
        // Solo el boton principal, y nunca desde un control: pulsar largo sobre un
        // boton o un campo no debe empezar a arrastrar la tarjeta.
        if (evento.button !== 0) return;
        if (evento.target.closest('button, input, a, [role="button"]')) return;

        inicio.current = { x: evento.clientX, y: evento.clientY };
        const objetivo = evento.currentTarget;
        const pointerId = evento.pointerId;

        temporizador.current = window.setTimeout(() => {
          arrastrando.current = true;
          indices.current = { desde: index, hasta: index };
          centros.current = new Map(
            [...contenedores.current].map(([i, nodo]) => {
              const caja = nodo.getBoundingClientRect();
              return [i, caja.top + caja.height / 2];
            }),
          );
          setDragIndex(index);
          setOverIndex(index);
          setDragOffset(0);
          // Capturar el puntero retiene el movimiento en esta tarjeta aunque el
          // dedo la abandone; sin esto el arrastre se corta al salir de ella.
          try {
            objetivo.setPointerCapture(pointerId);
          } catch {
            // El puntero pudo soltarse justo antes de vencer el retardo: no pasa nada.
          }
          // El aviso haptico es la unica senal tactil de que el modo cambio.
          navigator.vibrate?.(10);
        }, RETARDO);
      },
      onPointerMove: (evento) => {
        if (!arrastrando.current) {
          const dx = Math.abs(evento.clientX - inicio.current.x);
          const dy = Math.abs(evento.clientY - inicio.current.y);
          if (dx > TOLERANCIA || dy > TOLERANCIA) limpiarTemporizador();
          return;
        }
        setDragOffset(evento.clientY - inicio.current.y);

        // Con el puntero capturado, todos los movimientos llegan aqui. El destino
        // es la tarjeta cuyo centro capturado queda mas cerca del dedo: es estable
        // aunque la tarjeta activa se este moviendo, y no deja huecos muertos entre
        // tarjetas.
        let mejor = indices.current.hasta;
        let distancia = Infinity;
        for (const [i, centro] of centros.current) {
          const d = Math.abs(evento.clientY - centro);
          if (d < distancia) {
            distancia = d;
            mejor = i;
          }
        }
        if (mejor !== indices.current.hasta) {
          indices.current.hasta = mejor;
          setOverIndex(mejor);
        }
      },
      onPointerUp: terminar,
      onPointerCancel: terminar,
    }),
    [limpiarTemporizador, terminar],
  );

  return { dragIndex, overIndex, dragOffset, getHandlers, total: count };
}
