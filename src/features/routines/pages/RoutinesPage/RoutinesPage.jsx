import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import Modal from '@shared/components/Modal/Modal';
import useTranslation from '@i18n/useTranslation';
import { useExercises } from '@features/exercises';

import RoutineForm from '../../components/RoutineForm/RoutineForm';
import RoutineList from '../../components/RoutineList/RoutineList';
import useRoutines from '../../hooks/useRoutines';

import './RoutinesPage.scss';

/** Listado de rutinas. */
export default function RoutinesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('routines');
  const { routines, addRoutine } = useRoutines();
  const { exercises } = useExercises();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = (data) => {
    const result = addRoutine(data);
    setShowCreateForm(false);
    if (result.ok) navigate(`/routines/${result.routine.id}`);
  };

  return (
    <div className="c-routines-page">
      <RoutineList
        routines={routines}
        allExercises={exercises}
        onRoutineClick={(routine) => navigate(`/routines/${routine.id}`)}
      />

      <button
        type="button"
        className="c-routines-page__fab"
        onClick={() => setShowCreateForm(true)}
        aria-label={t('detail.createAction')}
      >
        <Icon path={mdiPlus} size={1.2} />
      </button>

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t('form.createTitle')}
      >
        <RoutineForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      </Modal>
    </div>
  );
}
