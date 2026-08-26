import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import useExercises from './hooks/useExercises';
import MuscleGroupFilter from '../muscle-groups/components/MuscleGroupFilter/MuscleGroupFilter';
import SearchBar from '../shared/components/SearchBar/SearchBar';
import ExerciseList from './components/ExerciseList/ExerciseList';
import ExerciseDetail from './components/ExerciseDetail/ExerciseDetail';
import ExerciseForm from './components/ExerciseForm/ExerciseForm';
import Modal from '../shared/components/Modal/Modal';
import './ExercisesPage.scss';

export default function ExercisesPage() {
  const {
    exercises,
    allExercises,
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  } = useExercises();

  const [selectedId, setSelectedId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Find selected exercise from all exercises (not filtered)
  const selectedExercise = selectedId
    ? allExercises.find((ex) => ex.id === selectedId) || null
    : null;

  // Auto-deselect if exercise was deleted
  useEffect(() => {
    if (selectedId && !allExercises.find((ex) => ex.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, allExercises]);

  const handleCreateExercise = (data) => {
    addExercise(data.name, data.muscleGroup, data.categories);
    setShowCreateForm(false);
  };

  if (selectedExercise) {
    return (
      <ExerciseDetail
        exercise={selectedExercise}
        onClose={() => setSelectedId(null)}
        onUpdate={updateExercise}
        onDelete={deleteExercise}
        onAddSet={addSet}
        onUpdateSet={updateSet}
        onDeleteSet={deleteSet}
      />
    );
  }

  return (
    <div className="exercises-page">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar ejercicio…"
      />

      <MuscleGroupFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <ExerciseList
        exercises={exercises}
        onExerciseClick={(exercise) => setSelectedId(exercise.id)}
      />

      <button
        className="exercises-page__fab"
        onClick={() => setShowCreateForm(true)}
        aria-label="Crear ejercicio"
      >
        <Icon path={mdiPlus} size={1.2} />
      </button>

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Nuevo ejercicio"
      >
        <ExerciseForm
          onSubmit={handleCreateExercise}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>
    </div>
  );
}
