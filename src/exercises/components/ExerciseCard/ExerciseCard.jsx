import { mdiDumbbell, mdiWeightLifter, mdiRun, mdiCog, mdiHelpCircle } from '@mdi/js';
import Icon from '@mdi/react';

import MuscleGroupBadge from '../../../muscle-groups/components/MuscleGroupBadge/MuscleGroupBadge';
import { getEquipmentLabel } from '../../constants/equipment';
import './ExerciseCard.scss';

const EQUIPMENT_ICONS = {
  barbell: mdiWeightLifter,
  dumbbell: mdiDumbbell,
  cable: mdiCog,
  machine: mdiCog,
  bodyweight: mdiRun,
  other: mdiHelpCircle,
};

export default function ExerciseCard({ exercise, onClick }) {
  const totalSets = exercise.sets.length;
  const maxWeight = exercise.sets.length ? Math.max(...exercise.sets.map((s) => s.weight)) : 0;
  const equipmentIcon = exercise.equipment
    ? (EQUIPMENT_ICONS[exercise.equipment] ?? mdiHelpCircle)
    : null;

  return (
    <button className="exercise-card" onClick={() => onClick(exercise)}>
      <div className="exercise-card__header">
        <h3 className="exercise-card__name">{exercise.name}</h3>
        <div className="exercise-card__badges">
          {equipmentIcon && (
            <span
              className="exercise-card__equipment"
              title={getEquipmentLabel(exercise.equipment)}
            >
              <Icon path={equipmentIcon} size={0.75} />
            </span>
          )}
          <MuscleGroupBadge groupId={exercise.muscleGroup} />
        </div>
      </div>
      <div className="exercise-card__stats">
        <div className="exercise-card__stat">
          <span className="exercise-card__stat-value">{totalSets}</span>
          <span className="exercise-card__stat-label">Sets</span>
        </div>
        <div className="exercise-card__stat">
          <span className="exercise-card__stat-value">{maxWeight}</span>
          <span className="exercise-card__stat-label">Max kg</span>
        </div>
      </div>
    </button>
  );
}
