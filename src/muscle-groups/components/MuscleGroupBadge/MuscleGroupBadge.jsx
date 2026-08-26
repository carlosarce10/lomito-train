import { getMuscleGroupLabel, getMuscleGroupColor } from '@/domain/catalogs';
import './MuscleGroupBadge.scss';

export default function MuscleGroupBadge({ groupId }) {
  const label = getMuscleGroupLabel(groupId);
  const color = getMuscleGroupColor(groupId);

  return (
    <span
      className="muscle-group-badge"
      style={{ backgroundColor: `${color}20`, color, borderColor: color }}
    >
      {label}
    </span>
  );
}
