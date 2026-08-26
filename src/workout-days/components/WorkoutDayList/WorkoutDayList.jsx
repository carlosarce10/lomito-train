import { resolveRoutineExercises } from '@/domain/model/routine';

import WorkoutDayCard from '../WorkoutDayCard/WorkoutDayCard';
import './WorkoutDayList.scss';

export default function WorkoutDayList({ workoutDays, allExercises, onDayClick }) {
  if (workoutDays.length === 0) {
    return (
      <div className="workout-day-list__empty">
        <p>No tienes rutinas todavía.</p>
        <p>Crea tu primera rutina con el botón +</p>
      </div>
    );
  }

  return (
    <div className="workout-day-list">
      {workoutDays.map((day) => {
        const exerciseCount = resolveRoutineExercises(day, allExercises).length;
        return (
          <WorkoutDayCard
            key={day.id}
            day={day}
            exerciseCount={exerciseCount}
            onClick={() => onDayClick(day)}
          />
        );
      })}
    </div>
  );
}
