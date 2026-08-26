import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import Modal from '@shared/components/Modal/Modal';
import SearchBar from '@shared/components/SearchBar/SearchBar';

import ExerciseForm from '../../components/ExerciseForm/ExerciseForm';
import ExerciseList from '../../components/ExerciseList/ExerciseList';
import MuscleGroupFilter from '../../components/MuscleGroupFilter/MuscleGroupFilter';
import useExerciseFilters from '../../hooks/useExerciseFilters';
import useExercises from '../../hooks/useExercises';

import './ExercisesPage.scss';

/** Listado de ejercicios del catalogo, con busqueda y filtro por grupo muscular. */
export default function ExercisesPage() {
  const navegar = useNavigate();
  const { exercises, addExercise } = useExercises();
  const { filtered, activeFilter, setActiveFilter, searchTerm, setSearchTerm } =
    useExerciseFilters(exercises);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = (datos) => {
    const resultado = addExercise(datos);
    setShowCreateForm(false);
    if (resultado.ok) navegar(`/exercises/${resultado.exercise.id}`);
  };

  return (
    <div className="c-exercises-page">
      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar ejercicio…" />

      <MuscleGroupFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <ExerciseList
        exercises={filtered}
        onExerciseClick={(exercise) => navegar(`/exercises/${exercise.id}`)}
      />

      <button
        type="button"
        className="c-exercises-page__fab"
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
        <ExerciseForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      </Modal>
    </div>
  );
}
