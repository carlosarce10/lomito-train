import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import Modal from '@shared/components/Modal/Modal';
import { useExercises } from '@features/exercises';

import RoutineDetail from '../../components/RoutineDetail/RoutineDetail';
import RoutineForm from '../../components/RoutineForm/RoutineForm';
import RoutineList from '../../components/RoutineList/RoutineList';
import useRoutines from '../../hooks/useRoutines';
import './RoutinesPage.scss';

export default function RoutinesPage() {
  const {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
  } = useRoutines();

  const { exercises, updateExercise, addSet, updateSet, deleteSet } = useExercises();

  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = (data) => {
    addRoutine(data);
    setShowCreateForm(false);
  };

  // Se guarda el id y no el objeto: resolver en cada render evita el setState
  // durante el render que hacia falta cuando la rutina abierta se borraba.
  const selectedRoutine = selectedRoutineId
    ? (routines.find((routine) => routine.id === selectedRoutineId) ?? null)
    : null;

  if (selectedRoutine) {
    return (
      <RoutineDetail
        routine={selectedRoutine}
        allExercises={exercises}
        onBack={() => setSelectedRoutineId(null)}
        onUpdate={updateRoutine}
        onDelete={(id) => {
          deleteRoutine(id);
          setSelectedRoutineId(null);
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

  return (
    <div className="c-routines-page">
      <RoutineList
        routines={routines}
        allExercises={exercises}
        onRoutineClick={(routine) => setSelectedRoutineId(routine.id)}
      />

      <button
        className="c-routines-page__fab"
        onClick={() => setShowCreateForm(true)}
        aria-label="Crear rutina"
      >
        <Icon path={mdiPlus} size={1.2} />
      </button>

      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Nueva rutina">
        <RoutineForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      </Modal>
    </div>
  );
}
