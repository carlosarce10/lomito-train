import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import MuscleGroupFilter from '../muscle-groups/components/MuscleGroupFilter/MuscleGroupFilter';
import Modal from '../shared/components/Modal/Modal';
import SearchBar from '../shared/components/SearchBar/SearchBar';

import ExerciseDetail from './components/ExerciseDetail/ExerciseDetail';
import ExerciseForm from './components/ExerciseForm/ExerciseForm';
import ExerciseList from './components/ExerciseList/ExerciseList';
import useExerciseFilters from './hooks/useExerciseFilters';
import useExercises from './hooks/useExercises';
import './ExercisesPage.scss';

export default function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise, addSet, updateSet, deleteSet } =
    useExercises();
  const { filtered, activeFilter, setActiveFilter, searchTerm, setSearchTerm } =
    useExerciseFilters(exercises);

  const [selectedId, setSelectedId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Resuelve el ejercicio abierto contra la lista sin filtrar. Si se borro, cae a null
  // y la pagina vuelve al listado sola, sin necesidad de limpiar selectedId.
  const selectedExercise = selectedId
    ? (exercises.find((ex) => ex.id === selectedId) ?? null)
    : null;

  const handleCreateExercise = (data) => {
    addExercise(data);
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
      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar ejercicio…" />

      <MuscleGroupFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <ExerciseList
        exercises={filtered}
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
        <ExerciseForm onSubmit={handleCreateExercise} onCancel={() => setShowCreateForm(false)} />
      </Modal>
    </div>
  );
}
