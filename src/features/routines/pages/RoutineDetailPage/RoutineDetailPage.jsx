import { Navigate, useNavigate, useParams } from 'react-router';

import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';
import { useExercises } from '@features/exercises';

import RoutineDetail from '../../components/RoutineDetail/RoutineDetail';
import useRoutines from '../../hooks/useRoutines';

/**
 * Detalle de una rutina, direccionable por URL.
 *
 * Las operaciones bajan envueltas: el fallo ocurre dentro de un componente hijo,
 * pero el aviso tiene que salir igual, asi que se comprueba el `ok` aqui, en el
 * unico punto por el que pasan todas.
 */
export default function RoutineDetailPage() {
  const { routineId } = useParams();
  const navegar = useNavigate();
  const toast = useToast();
  const { tn } = useTranslation();
  const {
    routines,
    updateRoutine,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
  } = useRoutines();
  const { exercises, updateExercise, addSet, updateSet, deleteSet } = useExercises();

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

  const routine = routines.find((r) => r.id === routineId);
  if (!routine) return <Navigate to="/routines" replace />;

  // Solo se sale de la pantalla si el borrado se guardo: si no, la rutina sigue
  // existiendo y volver al listado haria creer que desaparecio.
  const handleDelete = (id) => {
    if (avisarSiFallo(deleteRoutine(id)).ok) navegar('/routines', { replace: true });
  };

  return (
    <RoutineDetail
      routine={routine}
      allExercises={exercises}
      existingNames={routines}
      onBack={() => navegar('/routines')}
      onUpdate={(id, cambios) => avisarSiFallo(updateRoutine(id, cambios))}
      onDelete={handleDelete}
      onAddExercise={(id, exerciseId) => avisarSiFallo(addExerciseToRoutine(id, exerciseId))}
      onRemoveExercise={(id, exerciseId) =>
        avisarSiFallo(removeExerciseFromRoutine(id, exerciseId))
      }
      onUpdateExercise={(id, cambios) => avisarSiFallo(updateExercise(id, cambios))}
      onAddSet={(id) => avisarSiFallo(addSet(id))}
      onUpdateSet={(id, setId, cambios) => avisarSiFalloLaSerie(updateSet(id, setId, cambios))}
      onDeleteSet={(id, setId) => avisarSiFallo(deleteSet(id, setId))}
    />
  );
}
