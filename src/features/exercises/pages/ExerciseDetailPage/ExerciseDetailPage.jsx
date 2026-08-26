import { Navigate, useNavigate, useParams } from 'react-router';

import ExerciseDetail from '../../components/ExerciseDetail/ExerciseDetail';
import useExercises from '../../hooks/useExercises';

/**
 * Detalle de un ejercicio, direccionable por URL.
 *
 * Si el id no resuelve (por ejemplo tras borrarlo, o al abrir un enlace viejo)
 * redirige al listado en lugar de renderizar una pantalla vacia.
 */
export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const navegar = useNavigate();
  const { exercises, updateExercise, deleteExercise, addSet, updateSet, deleteSet } =
    useExercises();

  const exercise = exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return <Navigate to="/exercises" replace />;

  return (
    <ExerciseDetail
      exercise={exercise}
      onClose={() => navegar('/exercises')}
      onUpdate={updateExercise}
      onDelete={deleteExercise}
      onAddSet={addSet}
      onUpdateSet={updateSet}
      onDeleteSet={deleteSet}
    />
  );
}
