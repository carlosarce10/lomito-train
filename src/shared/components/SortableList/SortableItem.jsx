import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';

// Un arrastre no puede empezar sobre un control: pulsar largo en un boton o
// escribir en un campo no es querer mover la tarjeta, y espacio dentro de un campo
// de texto tampoco debe levantarla.
const CONTROLES = 'button, input, a, [role="button"]';

/**
 * Elemento de una SortableList.
 *
 * El transform y la transition van en linea porque los calcula la libreria en cada
 * cuadro; la regla 3 de CLAUDE.md solo prohibe estilos en linea de color, fondo o
 * borde. La elevacion visual (escala, sombra) la pone el SCSS del consumidor sobre
 * el estado is-active, con la propiedad scale, que convive con el transform en linea.
 *
 * @param {object} props
 * @param {string} props.id Id estable del elemento.
 * @param {string} [props.className] Clase del consumidor.
 * @param {import('react').ReactNode} props.children Contenido.
 */
export default function SortableItem({ id, className = '', children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // Los listeners de dnd-kit, envueltos para que un evento nacido en un control no
  // inicie el arrastre. Ojo con el matiz que costo encontrar: el propio contenedor
  // lleva role="button" porque se lo ponen los attributes de dnd-kit, asi que un
  // closest ingenuo se matchearia a si mismo y bloquearia todos los arrastres. El
  // control tiene que ser un descendiente, no el contenedor.
  const listenersFiltrados = useMemo(() => {
    if (!listeners) return listeners;
    return Object.fromEntries(
      Object.entries(listeners).map(([evento, manejar]) => [
        evento,
        (sintetico) => {
          const control = sintetico.target.closest?.(CONTROLES);
          if (control && control !== sintetico.currentTarget) return;
          manejar(sintetico);
        },
      ]),
    );
  }, [listeners]);

  return (
    <div
      ref={setNodeRef}
      className={`${className}${isDragging ? ' is-active' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listenersFiltrados}
    >
      {children}
    </div>
  );
}
