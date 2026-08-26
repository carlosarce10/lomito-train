import { mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';

import { getRoutineColor } from '@domain/catalogs';
import useTranslation from '@i18n/useTranslation';

import './RoutineCard.scss';

/** Tarjeta de una rutina con su color, su nombre y cuantos ejercicios contiene. */
export default function RoutineCard({ routine, exerciseCount, onClick }) {
  const { tn } = useTranslation('routines');

  return (
    <button
      className="c-routine-card"
      onClick={onClick}
      style={{ '--routine-color': getRoutineColor(routine.colorId) }}
    >
      <span className="c-routine-card__dot" />
      <div className="c-routine-card__body">
        <span className="c-routine-card__name">{routine.name}</span>
        <span className="c-routine-card__count">
          {tn('exercises', 'count', { count: exerciseCount })}
        </span>
      </div>
      <span className="c-routine-card__arrow" aria-hidden="true">
        <Icon path={mdiChevronRight} size={0.9} />
      </span>
    </button>
  );
}
