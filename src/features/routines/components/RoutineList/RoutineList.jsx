import { resolveRoutineExercises } from '@domain/model/routine';

import RoutineCard from '../RoutineCard/RoutineCard';
import './RoutineList.scss';

export default function RoutineList({ routines, allExercises, onRoutineClick }) {
  if (routines.length === 0) {
    return (
      <div className="routine-list__empty">
        <p>No tienes rutinas todavía.</p>
        <p>Crea tu primera rutina con el botón +</p>
      </div>
    );
  }

  return (
    <div className="routine-list">
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
