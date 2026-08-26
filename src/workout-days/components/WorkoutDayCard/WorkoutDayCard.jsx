import './WorkoutDayCard.scss';

export default function WorkoutDayCard({ day, exerciseCount, onClick }) {
  return (
    <button className="workout-day-card" onClick={onClick} style={{ '--day-color': day.color }}>
      <span className="workout-day-card__dot" />
      <div className="workout-day-card__body">
        <span className="workout-day-card__name">{day.name}</span>
        <span className="workout-day-card__count">
          {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
      </div>
      <span className="workout-day-card__arrow">›</span>
    </button>
  );
}
