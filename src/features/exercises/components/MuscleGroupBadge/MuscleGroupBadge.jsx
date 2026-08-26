import { getMuscleGroupColor } from '@domain/catalogs';
import Chip from '@shared/components/Chip/Chip';
import useTranslation from '@i18n/useTranslation';

/**
 * Etiqueta de un grupo muscular.
 *
 * El color viene del catalogo, es decir es dato, no tema, y Chip lo inyecta como
 * custom property: la regla 3 de CLAUDE.md prohibe un style en linea con color,
 * porque gana a cualquier regla de autor y ningun bloque de tema podria corregirlo.
 * La etiqueta viene de i18n, porque el catalogo solo guarda ids.
 *
 * @param {object} props
 * @param {string} props.groupId Id del catalogo.
 */
export default function MuscleGroupBadge({ groupId }) {
  const { tn } = useTranslation();
  return (
    <Chip color={getMuscleGroupColor(groupId)}>{tn('catalog', `muscleGroups.${groupId}`)}</Chip>
  );
}
