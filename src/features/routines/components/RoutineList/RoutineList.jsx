import { resolveRoutineExercises } from '@domain/model/routine';
import useTranslation from '@i18n/useTranslation';

import RoutineCard from '../RoutineCard/RoutineCard';
import './RoutineList.scss';

/** Lista de rutinas del usuario, o el estado vacio si todavia no hay ninguna. */
export default function RoutineList({ routines, allExercises, onRoutineClick }) {
  const { t } = useTranslation('routines');

  if (routines.length === 0) {
    return (
      <div className="c-routine-list__empty">
        <p>{t('list.emptyTitle')}</p>
        <p>{t('list.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="c-routine-list">
      {routines.map((routine) => {
        const exerciseCount = resolveRoutineExercises(routine, allExercises).length;
        return (
          <RoutineCard
            key={routine.id}
            routine={routine}
            exerciseCount={exerciseCount}
            onClick={() => onRoutineClick(routine)}
          />
        );
      })}
    </div>
  );
}
