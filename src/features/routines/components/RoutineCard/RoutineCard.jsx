import { getRoutineColor } from '@domain/catalogs';

import './RoutineCard.scss';

export default function RoutineCard({ routine, exerciseCount, onClick }) {
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
          {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
      </div>
      <span className="c-routine-card__arrow">›</span>
    </button>
  );
}
