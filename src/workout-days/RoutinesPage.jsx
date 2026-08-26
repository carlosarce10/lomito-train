import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import useExercises from '../exercises/hooks/useExercises';
import Modal from '../shared/components/Modal/Modal';

import WorkoutDayDetail from './components/WorkoutDayDetail/WorkoutDayDetail';
import WorkoutDayForm from './components/WorkoutDayForm/WorkoutDayForm';
import WorkoutDayList from './components/WorkoutDayList/WorkoutDayList';
import useWorkoutDays from './hooks/useWorkoutDays';
import './RoutinesPage.scss';

export default function RoutinesPage() {
  const {
    workoutDays,
    addWorkoutDay,
    updateWorkoutDay,
    deleteWorkoutDay,
    addExerciseToDay,
    removeExerciseFromDay,
  } = useWorkoutDays();

  const { exercises, updateExercise, addSet, updateSet, deleteSet } = useExercises();

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = (data) => {
    addWorkoutDay(data.name, data.color);
    setShowCreateForm(false);
  };

  // Se guarda el id y no el objeto: resolver en cada render evita el setState
  // durante el render que hacia falta cuando la rutina abierta se borraba.
  const selectedDay = selectedDayId
    ? (workoutDays.find((d) => d.id === selectedDayId) ?? null)
    : null;

  if (selectedDay) {
    return (
      <WorkoutDayDetail
        day={selectedDay}
        allExercises={exercises}
        onBack={() => setSelectedDayId(null)}
        onUpdate={updateWorkoutDay}
        onDelete={(id) => {
          deleteWorkoutDay(id);
          setSelectedDayId(null);
        }}
        onAddExercise={addExerciseToDay}
        onRemoveExercise={removeExerciseFromDay}
        onUpdateExercise={updateExercise}
        onAddSet={addSet}
        onUpdateSet={updateSet}
        onDeleteSet={deleteSet}
      />
    );
  }

  return (
    <div className="routines-page">
      <WorkoutDayList
        workoutDays={workoutDays}
        allExercises={exercises}
        onDayClick={(day) => setSelectedDayId(day.id)}
      />

      <button
        className="routines-page__fab"
        onClick={() => setShowCreateForm(true)}
        aria-label="Crear rutina"
      >
        <Icon path={mdiPlus} size={1.2} />
      </button>

      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Nueva rutina">
        <WorkoutDayForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      </Modal>
    </div>
  );
}
