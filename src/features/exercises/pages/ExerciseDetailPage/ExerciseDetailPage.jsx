import { Navigate, useNavigate, useParams } from 'react-router';

import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';

import ExerciseDetail from '../../components/ExerciseDetail/ExerciseDetail';
import useExercises from '../../hooks/useExercises';

/**
 * Detalle de un ejercicio, direccionable por URL.
 *
 * Si el id no resuelve (por ejemplo tras borrarlo, o al abrir un enlace viejo)
 * redirige al listado en lugar de renderizar una pantalla vacia.
 *
 * Las operaciones bajan envueltas: el fallo ocurre dentro de un componente hijo,
 * pero el aviso tiene que salir igual, asi que se comprueba el `ok` aqui, en el
 * unico punto por el que pasan todas.
 */
export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const navegar = useNavigate();
  const toast = useToast();
  const { tn } = useTranslation();
  const { exercises, updateExercise, deleteExercise, addSet, updateSet, deleteSet } =
    useExercises();

  const avisarSiFallo = (resultado) => {
    if (!resultado?.ok) toast.error(tn('common', 'error.writeFailed'));
    return resultado;
  };

  // Un valor de serie que no pasa la validacion vuelve con `issue`: eso no es un
  // fallo de escritura y lo muestra la propia fila, no un aviso flotante.
  const avisarSiFalloLaSerie = (resultado) => {
    if (resultado?.ok || resultado?.issue) return resultado;
    return avisarSiFallo(resultado);
  };

  const exercise = exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return <Navigate to="/exercises" replace />;

  return (
    <ExerciseDetail
      exercise={exercise}
      existingNames={exercises}
      onClose={() => navegar('/exercises')}
      onUpdate={(id, cambios) => avisarSiFallo(updateExercise(id, cambios))}
      onDelete={(id) => avisarSiFallo(deleteExercise(id))}
      onAddSet={(id) => avisarSiFallo(addSet(id))}
      onUpdateSet={(id, setId, cambios) => avisarSiFalloLaSerie(updateSet(id, setId, cambios))}
      onDeleteSet={(id, setId) => avisarSiFallo(deleteSet(id, setId))}
    />
  );
}
