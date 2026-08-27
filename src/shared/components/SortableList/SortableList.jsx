import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Distinguir arrastrar de hacer scroll: el gesto solo se activa tras mantener
// pulsado, y se cancela si el dedo se mueve antes de vencer el retardo.
const ACTIVACION = { delay: 350, tolerance: 8 };

/**
 * Lista vertical reordenable, sobre dnd-kit.
 *
 * Se usa una libreria y no el gesto artesanal anterior por lo que trae de serie:
 * el sensor tactil bloquea el scroll de forma correcta mientras se arrastra, los
 * elementos se apartan animados para hacer sitio, y el sensor de teclado permite
 * levantar con espacio y mover con las flechas, que recupera la via accesible.
 *
 * El filtro de controles interactivos vive en SortableItem, envolviendo los
 * listeners, y no en un sensor subclasado: el contenedor arrastrable lleva
 * role button, asi que el filtro necesita distinguir el contenedor de sus
 * controles internos, y eso se decide mejor donde se conocen los dos.
 *
 * Es un componente de shared: no conoce el dominio ni el idioma. Los textos que
 * anuncia el lector de pantalla llegan ya traducidos en `accessibility`.
 *
 * @param {object} props
 * @param {string[]} props.ids Ids en el orden actual. Deben coincidir con los items.
 * @param {(from: number, to: number) => void} props.onReorder Indices sobre `ids`.
 * @param {object} props.accessibility Con la forma que espera DndContext:
 *   `{ announcements, screenReaderInstructions }`, ya traducidos.
 * @param {import('react').ReactNode} props.children Los SortableItem.
 */
export default function SortableList({ ids, onReorder, accessibility, children }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: ACTIVACION }),
    useSensor(TouchSensor, { activationConstraint: ACTIVACION }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from !== -1 && to !== -1) onReorder(from, to);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={accessibility}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
