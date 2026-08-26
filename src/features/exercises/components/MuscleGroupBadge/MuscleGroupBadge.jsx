import { getMuscleGroupColor, getMuscleGroupLabel } from '@domain/catalogs';

import './MuscleGroupBadge.scss';

/**
 * Etiqueta de un grupo muscular.
 *
 * El color viene del catalogo, es decir es dato, no tema. Se inyecta como custom
 * property y es el SCSS el que decide como se usa: la regla 3 de CLAUDE.md prohibe
 * un style en linea con color, fondo o borde, porque un estilo en linea gana a
 * cualquier regla de autor y ningun bloque de tema podria corregirlo.
 *
 * @param {object} props
 * @param {string} props.groupId Id del catalogo.
 */
export default function MuscleGroupBadge({ groupId }) {
  return (
    <span
      className="c-muscle-group-badge"
      style={{ '--group-color': getMuscleGroupColor(groupId) }}
    >
      {getMuscleGroupLabel(groupId)}
    </span>
  );
}
