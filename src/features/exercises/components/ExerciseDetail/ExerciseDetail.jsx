import { mdiArrowLeft, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import Button from '@shared/components/Button/Button';
import Modal from '@shared/components/Modal/Modal';
import NumberField from '@shared/components/NumberField/NumberField';
import useTranslation from '@i18n/useTranslation';

import ExerciseForm from '../ExerciseForm/ExerciseForm';
import MuscleGroupBadgeList from '../MuscleGroupBadgeList/MuscleGroupBadgeList';
import './ExerciseDetail.scss';

// El nombre del ejercicio va en negrita dentro de la frase de confirmacion. En vez
// de meter etiquetas HTML en la clave, se pide la frase sin interpolar y se parte
// por el hueco: asi la traduccion puede mover el nombre a donde su idioma lo ponga.
const NAME_SLOT = '{{name}}';

export default function ExerciseDetail({
  exercise,
  onClose,
  onUpdate,
  onDelete,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const { t, tn, formatNumber } = useTranslation('exercises');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditSubmit = (data) => {
    onUpdate(exercise.id, data);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(exercise.id);
    onClose();
  };

  // El valor llega crudo: lo valida el dominio y devuelve si lo acepto.
  const handleSetChange = (setId, field, raw) =>
    raw === '' ? { ok: true } : onUpdateSet(exercise.id, setId, { [field]: raw });

  const [confirmBefore, confirmAfter = ''] = t('detail.deleteConfirm').split(NAME_SLOT);

  return (
    <div className="c-exercise-detail">
      <div className="c-exercise-detail__top">
        <button className="c-exercise-detail__back" onClick={onClose}>
          <Icon path={mdiArrowLeft} size={0.9} />
          {tn('common', 'action.back')}
        </button>
        <div className="c-exercise-detail__actions-top">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            {tn('common', 'action.edit')}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            {tn('common', 'action.delete')}
          </Button>
        </div>
      </div>

      <div className="c-exercise-detail__info">
        <h2 className="c-exercise-detail__name">{exercise.name}</h2>
        <MuscleGroupBadgeList groupIds={exercise.muscleGroupIds} />
      </div>

      <div className="c-exercise-detail__sets-section">
        <div className="c-exercise-detail__sets-header">
          <h3 className="c-exercise-detail__sets-title">{t('detail.setsTitle')}</h3>
          <Button size="sm" onClick={() => onAddSet(exercise.id)}>
            {t('detail.addSet')}
          </Button>
        </div>

        {exercise.sets.length === 0 ? (
          <p className="c-exercise-detail__sets-empty">{t('detail.setsEmpty')}</p>
        ) : (
          <div className="c-exercise-detail__sets-table">
            <div className="c-exercise-detail__sets-row c-exercise-detail__sets-row--header">
              <span className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--num">
                #
              </span>
              <span className="c-exercise-detail__sets-cell">{tn('common', 'field.weight')}</span>
              <span className="c-exercise-detail__sets-cell">{tn('common', 'field.reps')}</span>
              <span className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--action"></span>
            </div>
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="c-exercise-detail__sets-row">
                <span className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--num">
                  {formatNumber(index + 1, 'integer')}
                </span>
                <div className="c-exercise-detail__sets-cell">
                  <NumberField
                    className="c-exercise-detail__sets-input"
                    inputMode="decimal"
                    value={set.weight}
                    placeholder="0"
                    aria-label={tn('common', 'field.weightAria')}
                    onCommit={(raw) => handleSetChange(set.id, 'weight', raw)}
                  />
                </div>
                <div className="c-exercise-detail__sets-cell">
                  <NumberField
                    className="c-exercise-detail__sets-input"
                    inputMode="numeric"
                    value={set.reps}
                    placeholder="0"
                    aria-label={tn('common', 'field.repsAria')}
                    onCommit={(raw) => handleSetChange(set.id, 'reps', raw)}
                  />
                </div>
                <div className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--action">
                  <button
                    className="c-exercise-detail__sets-delete"
                    onClick={() => onDeleteSet(exercise.id, set.id)}
                    aria-label={t('detail.deleteSet')}
                  >
                    <Icon path={mdiClose} size={0.7} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar ejercicio */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title={t('form.editTitle')}>
        <ExerciseForm
          initialData={exercise}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('detail.deleteTitle')}
      >
        <div className="c-exercise-detail__confirm">
          <p className="c-exercise-detail__confirm-text">
            {confirmBefore}
            <strong>{exercise.name}</strong>
            {confirmAfter}
          </p>
          <div className="c-exercise-detail__confirm-actions">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              {tn('common', 'action.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {tn('common', 'action.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
