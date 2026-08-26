import { mdiDumbbell, mdiWeightLifter, mdiRun, mdiCog, mdiHelpCircle } from '@mdi/js';
import Icon from '@mdi/react';

import { getEquipmentLabel } from '@domain/catalogs';
import { getMaxWeight } from '@domain/model/records';

import MuscleGroupBadgeList from '../MuscleGroupBadgeList/MuscleGroupBadgeList';
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
  const maxWeight = getMaxWeight(exercise.sets);
  const equipmentIcon = exercise.equipmentId
    ? (EQUIPMENT_ICONS[exercise.equipmentId] ?? mdiHelpCircle)
    : null;

  return (
    <button className="exercise-card" onClick={() => onClick(exercise)}>
      <div className="exercise-card__header">
        <h3 className="exercise-card__name">{exercise.name}</h3>
        {equipmentIcon && (
          <span
            className="exercise-card__equipment"
            title={getEquipmentLabel(exercise.equipmentId)}
          >
            <Icon path={equipmentIcon} size={0.75} />
          </span>
        )}
      </div>
      {/* Las etiquetas van en su propia fila: compitiendo con el nombre en la misma
          linea, un ejercicio con dos grupos truncaba el titulo en pantalla estrecha. */}
      <MuscleGroupBadgeList groupIds={exercise.muscleGroupIds} max={3} />
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
