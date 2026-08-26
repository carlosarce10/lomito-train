import { mdiDumbbell } from '@mdi/js';
import Icon from '@mdi/react';

import ExerciseCard from '../ExerciseCard/ExerciseCard';
import './ExerciseList.scss';

export default function ExerciseList({ exercises, onExerciseClick }) {
  if (exercises.length === 0) {
    return (
      <div className="c-exercise-list__empty">
        <span className="c-exercise-list__empty-icon">
          <Icon path={mdiDumbbell} size={2} />
        </span>
        <p className="c-exercise-list__empty-text">No hay ejercicios registrados</p>
        <p className="c-exercise-list__empty-hint">
          Toca el boton + para agregar tu primer ejercicio
        </p>
      </div>
    );
  }

  return (
    <div className="c-exercise-list">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} onClick={onExerciseClick} />
      ))}
    </div>
  );
}
