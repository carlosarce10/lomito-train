import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import Modal from '@shared/components/Modal/Modal';
import SearchBar from '@shared/components/SearchBar/SearchBar';
import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';

import ExerciseForm from '../../components/ExerciseForm/ExerciseForm';
import ExerciseList from '../../components/ExerciseList/ExerciseList';
import MuscleGroupFilter from '../../components/MuscleGroupFilter/MuscleGroupFilter';
import useExerciseFilters from '../../hooks/useExerciseFilters';
import useExercises from '../../hooks/useExercises';

import './ExercisesPage.scss';

/** Listado de ejercicios del catalogo, con busqueda y filtro por grupo muscular. */
export default function ExercisesPage() {
  const navegar = useNavigate();
  const { t, tn } = useTranslation('exercises');
  const toast = useToast();
  const { exercises, addExercise } = useExercises();
  const { filtered, activeFilter, setActiveFilter, searchTerm, setSearchTerm } =
    useExerciseFilters(exercises);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Si la escritura falla, el formulario se queda abierto con lo escrito: cerrarlo
  // borraria el trabajo del usuario justo cuando no se ha guardado nada.
  const handleCreate = (datos) => {
    const resultado = addExercise(datos);
    if (!resultado.ok) {
      toast.error(tn('common', 'error.writeFailed'));
      return;
    }
    setShowCreateForm(false);
    // Un aviso por accion completada: el listado y el detalle cambian solos, pero
    // nada confirmaba que el ejercicio quedo guardado.
    toast.success(t('toast.created'));
    navegar(`/exercises/${resultado.exercise.id}`);
  };

  return (
    <div className="c-exercises-page">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t('page.searchPlaceholder')}
      />

      <MuscleGroupFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <ExerciseList
        exercises={filtered}
        onExerciseClick={(exercise) => navegar(`/exercises/${exercise.id}`)}
      />

      <button
        type="button"
        className="c-exercises-page__fab"
        onClick={() => setShowCreateForm(true)}
        aria-label={t('detail.createAction')}
      >
        <Icon path={mdiPlus} size={1.2} />
      </button>

      {/* Sin closeLabel, Modal cae en su 'Cerrar' escrito a mano y el boton de
          cierre se anuncia en espanol aunque la aplicacion este en ingles. */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t('form.createTitle')}
        closeLabel={tn('common', 'action.close')}
      >
        {/* La pagina tiene la coleccion completa: es la que puede avisar de nombres
            repetidos, porque el formulario solo conoce el suyo. */}
        <ExerciseForm
          existingNames={exercises}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>
    </div>
  );
}
