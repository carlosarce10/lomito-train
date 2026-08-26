import MuscleGroupBadge from '../MuscleGroupBadge/MuscleGroupBadge';

import './MuscleGroupBadgeList.scss';

/**
 * Muestra todos los grupos musculares de un ejercicio.
 *
 * Antes solo se pintaba el primero: el usuario seleccionaba tres, veia el contador
 * "(3)" en el formulario y luego una sola etiqueta. Los otros dos eran invisibles
 * en toda la aplicacion.
 *
 * @param {object} props
 * @param {string[]} props.groupIds Ids del catalogo.
 * @param {number} [props.max] Cuantos mostrar antes de resumir el resto.
 */
export default function MuscleGroupBadgeList({ groupIds, max = 3 }) {
  if (!groupIds?.length) return null;

  const visibles = groupIds.slice(0, max);
  const restantes = groupIds.length - visibles.length;

  return (
    <span className="c-muscle-group-badge-list">
      {visibles.map((id) => (
        <MuscleGroupBadge key={id} groupId={id} />
      ))}
      {restantes > 0 && <span className="c-muscle-group-badge-list__more">+{restantes}</span>}
    </span>
  );
}
