import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import Modal from '@shared/components/Modal/Modal';
import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';
import { useExercises } from '@features/exercises';

import RoutineForm from '../../components/RoutineForm/RoutineForm';
import RoutineList from '../../components/RoutineList/RoutineList';
import useRoutines from '../../hooks/useRoutines';

import './RoutinesPage.scss';

/** Listado de rutinas. */
export default function RoutinesPage() {
  const navigate = useNavigate();
  const { t, tn } = useTranslation('routines');
  const toast = useToast();
  const { routines, addRoutine } = useRoutines();
  const { exercises } = useExercises();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Si la escritura falla, el formulario se queda abierto con lo escrito: cerrarlo
  // borraria el trabajo del usuario justo cuando no se ha guardado nada.
  const handleCreate = (data) => {
    const result = addRoutine(data);
    if (!result.ok) {
      toast.error(tn('common', 'error.writeFailed'));
      return;
    }
    setShowCreateForm(false);
    navigate(`/routines/${result.routine.id}`);
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
        <RoutineForm
          existingNames={routines}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>
    </div>
  );
}
