import { getRoutineColor } from '@domain/catalogs';

import './RoutineCard.scss';

export default function RoutineCard({ routine, exerciseCount, onClick }) {
  return (
    <button
      className="routine-card"
      onClick={onClick}
      style={{ '--routine-color': getRoutineColor(routine.colorId) }}
    >
      <span className="routine-card__dot" />
      <div className="routine-card__body">
        <span className="routine-card__name">{routine.name}</span>
        <span className="routine-card__count">
          {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
      </div>
      <span className="routine-card__arrow">›</span>
    </button>
  );
}
