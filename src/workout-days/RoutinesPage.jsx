import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import useWorkoutDays from './hooks/useWorkoutDays';
import useExercises from '../exercises/hooks/useExercises';
import WorkoutDayList from './components/WorkoutDayList/WorkoutDayList';
import WorkoutDayDetail from './components/WorkoutDayDetail/WorkoutDayDetail';
import WorkoutDayForm from './components/WorkoutDayForm/WorkoutDayForm';
import Modal from '../shared/components/Modal/Modal';
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

  const { allExercises, updateExercise, addSet, updateSet, deleteSet } = useExercises();

  const [selectedDay, setSelectedDay] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = (data) => {
    addWorkoutDay(data.name, data.color);
    setShowCreateForm(false);
  };

  if (selectedDay) {
    const currentDay = workoutDays.find((d) => d.id === selectedDay.id);
    if (!currentDay) {
      setSelectedDay(null);
      return null;
    }
    return (
      <WorkoutDayDetail
        day={currentDay}
        allExercises={allExercises}
        onBack={() => setSelectedDay(null)}
        onUpdate={updateWorkoutDay}
        onDelete={(id) => { deleteWorkoutDay(id); setSelectedDay(null); }}
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
        allExercises={allExercises}
        onDayClick={setSelectedDay}
      />

      <button
        className="routines-page__fab"
        onClick={() => setShowCreateForm(true)}
        aria-label="Crear rutina"
      >
        <Icon path={mdiPlus} size={1.2} />
      </button>

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Nueva rutina"
      >
        <WorkoutDayForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>
    </div>
  );
}
