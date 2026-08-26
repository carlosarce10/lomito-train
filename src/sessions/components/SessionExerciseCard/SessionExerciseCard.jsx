import { getMuscleGroupColor } from '../../../muscle-groups/constants/muscleGroups';
import Button from '../../../shared/components/Button/Button';
import './SessionExerciseCard.scss';

export default function SessionExerciseCard({ exercise, previousSets, onUpdateSet, onAddSet, onDeleteSet }) {
  const color = getMuscleGroupColor(exercise.muscleGroup);

  // Compact previous session summary: "80×10, 85×8, 85×8"
  const prevSummary = previousSets?.length
    ? previousSets
        .filter((s) => s.done)
        .map((s) => `${s.weight}×${s.reps}`)
        .join('  ')
    : null;

  return (
    <div className="session-exercise-card">
      <div className="session-exercise-card__header">
        <span className="session-exercise-card__dot" style={{ background: color }} />
        <span className="session-exercise-card__name">{exercise.name}</span>
      </div>

      {prevSummary && (
        <div className="session-exercise-card__prev">
          <span className="session-exercise-card__prev-label">Última vez:</span>
          <span className="session-exercise-card__prev-values">{prevSummary}</span>
        </div>
      )}

      <div className="session-exercise-card__table">
        <div className="session-exercise-card__row session-exercise-card__row--header">
          <span>#</span>
          <span>Kg</span>
          <span>Reps</span>
          <span>✓</span>
          <span />
        </div>

        {exercise.sets.map((set, idx) => (
          <div
            key={set.id}
            className={`session-exercise-card__row${set.done ? ' session-exercise-card__row--done' : ''}`}
          >
            <span className="session-exercise-card__num">{idx + 1}</span>

            <input
              className="session-exercise-card__input"
              type="number"
              min="0"
              step="0.5"
              value={set.weight || ''}
              placeholder="0"
              onChange={(e) =>
                onUpdateSet(exercise.id, set.id, { weight: parseFloat(e.target.value) || 0 })
              }
            />

            <input
              className="session-exercise-card__input"
              type="number"
              min="0"
              value={set.reps || ''}
              placeholder="0"
              onChange={(e) =>
                onUpdateSet(exercise.id, set.id, { reps: parseInt(e.target.value) || 0 })
              }
            />

            <button
              className={`session-exercise-card__done${set.done ? ' session-exercise-card__done--active' : ''}`}
              onClick={() => onUpdateSet(exercise.id, set.id, { done: !set.done })}
              aria-label={set.done ? 'Marcar como pendiente' : 'Marcar como hecho'}
            >
              ✓
            </button>

            <button
              className="session-exercise-card__delete"
              onClick={() => onDeleteSet(exercise.id, set.id)}
              aria-label="Eliminar serie"
              disabled={exercise.sets.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={() => onAddSet(exercise.id)}>
        + Serie
      </Button>
    </div>
  );
}
