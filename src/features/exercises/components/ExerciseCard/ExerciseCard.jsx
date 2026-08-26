import { mdiDumbbell, mdiWeightLifter, mdiRun, mdiCog, mdiHelpCircle } from '@mdi/js';
import Icon from '@mdi/react';

import { getMaxWeight } from '@domain/model/records';
import useTranslation from '@i18n/useTranslation';

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
  const { t, tn, formatNumber } = useTranslation('exercises');
  const totalSets = exercise.sets.length;
  const maxWeight = getMaxWeight(exercise.sets);
  const equipmentIcon = exercise.equipmentId
    ? (EQUIPMENT_ICONS[exercise.equipmentId] ?? mdiHelpCircle)
    : null;

  return (
    <button className="c-exercise-card" onClick={() => onClick(exercise)}>
      <div className="c-exercise-card__header">
        <h3 className="c-exercise-card__name">{exercise.name}</h3>
        {equipmentIcon && (
          <span
            className="c-exercise-card__equipment"
            title={tn('catalog', `equipment.${exercise.equipmentId}`)}
          >
            <Icon path={equipmentIcon} size={0.75} />
          </span>
        )}
      </div>
      {/* Las etiquetas van en su propia fila: compitiendo con el nombre en la misma
          linea, un ejercicio con dos grupos truncaba el titulo en pantalla estrecha. */}
      <MuscleGroupBadgeList groupIds={exercise.muscleGroupIds} max={3} />
      <div className="c-exercise-card__stats">
        <div className="c-exercise-card__stat">
          <span className="c-exercise-card__stat-value">{formatNumber(totalSets, 'integer')}</span>
          <span className="c-exercise-card__stat-label">{t('card.sets')}</span>
        </div>
        <div className="c-exercise-card__stat">
          <span className="c-exercise-card__stat-value">{formatNumber(maxWeight, 'weight')}</span>
          <span className="c-exercise-card__stat-label">{t('card.maxWeight')}</span>
        </div>
      </div>
    </button>
  );
}
