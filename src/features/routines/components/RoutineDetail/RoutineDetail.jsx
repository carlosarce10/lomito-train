import { mdiArrowLeft, mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { getRoutineColor } from '@domain/catalogs';
import { resolveRoutineExercises } from '@domain/model/routine';
import Button from '@shared/components/Button/Button';
import Modal from '@shared/components/Modal/Modal';
import useTranslation from '@i18n/useTranslation';
import { ExerciseForm } from '@features/exercises';

import ExercisePicker from '../ExercisePicker/ExercisePicker';
import RoutineExerciseCard from '../RoutineExerciseCard/RoutineExerciseCard';
import RoutineForm from '../RoutineForm/RoutineForm';
import './RoutineDetail.scss';

// El nombre lo escribe el usuario y no se traduce. La frase se pide sin
// interpolar y se parte por el hueco: asi la traduccion decide donde va el nombre
// y la interfaz puede seguir destacandolo, como ya hace ExerciseDetail.
const NAME_SLOT = '{{name}}';

/** Parte una frase con hueco de nombre en las dos mitades que lo rodean. */
function splitAroundName(phrase) {
  const [before, after = ''] = phrase.split(NAME_SLOT);
  return [before, after];
}

export default function RoutineDetail({
  routine,
  allExercises,
  onBack,
  onUpdate,
  onDelete,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const { t, tn } = useTranslation('routines');
  const [showPicker, setShowPicker] = useState(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [removingExerciseId, setRemovingExerciseId] = useState(null);

  const routineExercises = resolveRoutineExercises(routine, allExercises);
  // Modal trae 'Cerrar' escrito a mano en su valor por defecto: se le pasa siempre.
  const closeLabel = tn('common', 'action.close');
  const [deleteBefore, deleteAfter] = splitAroundName(t('detail.deleteConfirm'));

  const handleToggleExercise = (exerciseId) => {
    if (routine.exerciseIds.includes(exerciseId)) {
      onRemoveExercise(routine.id, exerciseId);
    } else {
      onAddExercise(routine.id, exerciseId);
    }
  };

  const handleEditSubmit = (data) => {
    onUpdateExercise(editingExercise.id, data);
    setEditingExercise(null);
  };

  const handleConfirmRemove = () => {
    if (removingExerciseId) {
      onRemoveExercise(routine.id, removingExerciseId);
      setRemovingExerciseId(null);
    }
  };

  return (
    <div className="c-routine-detail">
      {/* Top bar */}
      <div className="c-routine-detail__top">
        <button className="c-routine-detail__back" onClick={onBack}>
          <Icon path={mdiArrowLeft} size={0.9} />
          {tn('common', 'nav.routines')}
        </button>
        <div className="c-routine-detail__top-actions">
          <button
            className="c-routine-detail__edit"
            onClick={() => setIsEditingRoutine(true)}
            aria-label={t('detail.editAction')}
          >
            <Icon path={mdiPencil} size={0.9} />
          </button>
          <button
            className="c-routine-detail__delete"
            onClick={() => setShowConfirmDelete(true)}
            aria-label={t('detail.deleteAction')}
          >
            <Icon path={mdiDelete} size={0.9} />
          </button>
        </div>
      </div>

      {/* Routine info */}
      <div className="c-routine-detail__info">
        <span
          className="c-routine-detail__color-dot"
          style={{ '--routine-color': getRoutineColor(routine.colorId) }}
        />
        <h2 className="c-routine-detail__name">{routine.name}</h2>
      </div>

      {/* Exercises section */}
      <div className="c-routine-detail__exercises-section">
        <div className="c-routine-detail__exercises-header">
          <span className="c-routine-detail__exercises-title">
            {t('detail.exercisesTitle', { count: routineExercises.length })}
          </span>
          <button
            className="c-routine-detail__add-btn"
            onClick={() => setShowPicker(true)}
            aria-label={t('detail.addExercise')}
          >
            <Icon path={mdiPlus} size={0.85} />
            {tn('common', 'action.add')}
          </button>
        </div>

        {routineExercises.length === 0 ? (
          <p className="c-routine-detail__empty">{t('detail.empty')}</p>
        ) : (
          <div className="c-routine-detail__exercise-list">
            <p className="c-routine-detail__swipe-hint">{t('detail.swipeHint')}</p>
            {routineExercises.map((ex) => (
              <RoutineExerciseCard
                key={ex.id}
                exercise={ex}
                onRemove={() => setRemovingExerciseId(ex.id)}
                onEdit={() => setEditingExercise(ex)}
                onAddSet={onAddSet}
                onUpdateSet={onUpdateSet}
                onDeleteSet={onDeleteSet}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exercise picker modal */}
      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)} closeLabel={closeLabel}>
        <ExercisePicker
          allExercises={allExercises}
          selectedIds={routine.exerciseIds}
          onToggle={handleToggleExercise}
          onClose={() => setShowPicker(false)}
        />
      </Modal>

      {/* Edit exercise modal */}
      <Modal
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        title={tn('exercises', 'form.editTitle')}
        closeLabel={closeLabel}
      >
        {editingExercise && (
          <ExerciseForm
            initialData={editingExercise}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingExercise(null)}
          />
        )}
      </Modal>

      {/* Confirm remove from routine modal */}
      <Modal
        isOpen={!!removingExerciseId}
        onClose={() => setRemovingExerciseId(null)}
        title={t('detail.removeTitle')}
        closeLabel={closeLabel}
      >
        {removingExerciseId &&
          (() => {
            const ex = allExercises.find((e) => e.id === removingExerciseId);
            const [removeBefore, removeAfter] = splitAroundName(t('detail.removeConfirm'));
            return (
              <div className="c-routine-detail__confirm">
                <p className="c-routine-detail__confirm-text">
                  {removeBefore}
                  <strong>{ex?.name}</strong>
                  {removeAfter}
                </p>
                <div className="c-routine-detail__confirm-actions">
                  <Button variant="ghost" onClick={() => setRemovingExerciseId(null)}>
                    {tn('common', 'action.cancel')}
                  </Button>
                  <Button variant="danger" onClick={handleConfirmRemove}>
                    {tn('common', 'action.remove')}
                  </Button>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Editar la rutina: nombre y color */}
      <Modal
        isOpen={isEditingRoutine}
        onClose={() => setIsEditingRoutine(false)}
        title={t('form.editTitle')}
        closeLabel={closeLabel}
      >
        <RoutineForm
          initialData={routine}
          onSubmit={(datos) => {
            onUpdate(routine.id, datos);
            setIsEditingRoutine(false);
          }}
          onCancel={() => setIsEditingRoutine(false)}
        />
      </Modal>

      {/* Confirm delete routine modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title={t('detail.deleteTitle')}
        closeLabel={closeLabel}
      >
        <div className="c-routine-detail__confirm">
          <p className="c-routine-detail__confirm-text">
            {deleteBefore}
            <strong>{routine.name}</strong>
            {deleteAfter}
          </p>
          <div className="c-routine-detail__confirm-actions">
            <Button variant="ghost" onClick={() => setShowConfirmDelete(false)}>
              {tn('common', 'action.cancel')}
            </Button>
            <Button variant="danger" onClick={() => onDelete(routine.id)}>
              {tn('common', 'action.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
