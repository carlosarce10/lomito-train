import { Navigate, useNavigate, useParams } from 'react-router';

import { useExercises } from '@features/exercises';

import RoutineDetail from '../../components/RoutineDetail/RoutineDetail';
import useRoutines from '../../hooks/useRoutines';

/** Detalle de una rutina, direccionable por URL. */
export default function RoutineDetailPage() {
  const { routineId } = useParams();
  const navegar = useNavigate();
  const {
    routines,
    updateRoutine,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
  } = useRoutines();
  const { exercises, updateExercise, addSet, updateSet, deleteSet } = useExercises();

  const routine = routines.find((r) => r.id === routineId);
  if (!routine) return <Navigate to="/routines" replace />;

  return (
    <RoutineDetail
      routine={routine}
      allExercises={exercises}
      onBack={() => navegar('/routines')}
      onUpdate={updateRoutine}
      onDelete={(id) => {
        deleteRoutine(id);
        navegar('/routines', { replace: true });
      }}
      onAddExercise={addExerciseToRoutine}
      onRemoveExercise={removeExerciseFromRoutine}
      onUpdateExercise={updateExercise}
      onAddSet={addSet}
      onUpdateSet={updateSet}
      onDeleteSet={deleteSet}
    />
  );
}
