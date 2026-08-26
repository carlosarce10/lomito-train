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

  // Un aviso por accion completada, no por pulsacion: se emite aqui, que es el unico
  // punto por el que pasan todas las operaciones. Las series quedan fuera a proposito,
  // porque NumberField confirma en cada tecla y la propia tabla ya muestra el cambio;
  // agregar y quitar ejercicios tambien, porque el selector se marca y desmarca de un
  // toque y avisaria por cada uno.
  const avisar = (resultado, exito) => {
    if (resultado?.ok) toast.success(exito);
    return avisarSiFallo(resultado);
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
    if (avisar(deleteRoutine(id), tn('routines', 'toast.deleted')).ok) {
      navegar('/routines', { replace: true });
    }
  };

  return (
    <RoutineDetail
      routine={routine}
      allExercises={exercises}
      existingNames={routines}
      onBack={() => navegar('/routines')}
      onUpdate={(id, cambios) =>
        avisar(updateRoutine(id, cambios), tn('routines', 'toast.updated'))
      }
      onDelete={handleDelete}
      onAddExercise={(id, exerciseId) => avisarSiFallo(addExerciseToRoutine(id, exerciseId))}
      onRemoveExercise={(id, exerciseId) =>
        avisarSiFallo(removeExerciseFromRoutine(id, exerciseId))
      }
      onUpdateExercise={(id, cambios) =>
        avisar(updateExercise(id, cambios), tn('exercises', 'toast.updated'))
      }
      onAddSet={(id) => avisarSiFallo(addSet(id))}
      onUpdateSet={(id, setId, cambios) => avisarSiFalloLaSerie(updateSet(id, setId, cambios))}
      onDeleteSet={(id, setId) => avisarSiFallo(deleteSet(id, setId))}
    />
  );
}
