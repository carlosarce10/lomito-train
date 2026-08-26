import { mdiArrowLeft, mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { getRoutineColor } from '@domain/catalogs';
import { resolveRoutineExercises } from '@domain/model/routine';
import Button from '@shared/components/Button/Button';
import Modal from '@shared/components/Modal/Modal';
import { ExerciseForm } from '@features/exercises';

import ExercisePicker from '../ExercisePicker/ExercisePicker';
import RoutineExerciseCard from '../RoutineExerciseCard/RoutineExerciseCard';
import RoutineForm from '../RoutineForm/RoutineForm';
import './RoutineDetail.scss';

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
  const [showPicker, setShowPicker] = useState(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [removingExerciseId, setRemovingExerciseId] = useState(null);

  const routineExercises = resolveRoutineExercises(routine, allExercises);

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
          Rutinas
        </button>
        <div className="c-routine-detail__top-actions">
          <button
            className="c-routine-detail__edit"
            onClick={() => setIsEditingRoutine(true)}
            aria-label="Editar rutina"
          >
            <Icon path={mdiPencil} size={0.9} />
          </button>
          <button
            className="c-routine-detail__delete"
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Eliminar rutina"
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
            Ejercicios ({routineExercises.length})
          </span>
          <button
            className="c-routine-detail__add-btn"
            onClick={() => setShowPicker(true)}
            aria-label="Agregar ejercicio"
          >
            <Icon path={mdiPlus} size={0.85} />
            Agregar
          </button>
        </div>

        {routineExercises.length === 0 ? (
          <p className="c-routine-detail__empty">
            Sin ejercicios. Agrega algunos con el botón de arriba.
          </p>
        ) : (
          <div className="c-routine-detail__exercise-list">
            <p className="c-routine-detail__swipe-hint">
              Desliza ← para quitar &nbsp;·&nbsp; → para editar
            </p>
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
      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)} title="">
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
        title="Editar ejercicio"
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
        title="Quitar ejercicio"
      >
        {removingExerciseId &&
          (() => {
            const ex = allExercises.find((e) => e.id === removingExerciseId);
            return (
              <div className="c-routine-detail__confirm">
                <p className="c-routine-detail__confirm-text">
                  ¿Quitar <strong>{ex?.name}</strong> de esta rutina?
                </p>
                <div className="c-routine-detail__confirm-actions">
                  <Button variant="ghost" onClick={() => setRemovingExerciseId(null)}>
                    Cancelar
                  </Button>
                  <Button variant="danger" onClick={handleConfirmRemove}>
                    Quitar
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
        title="Editar rutina"
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
        title="Eliminar rutina"
      >
        <div className="c-routine-detail__confirm">
          <p className="c-routine-detail__confirm-text">
            ¿Eliminar <strong>{routine.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="c-routine-detail__confirm-actions">
            <Button variant="ghost" onClick={() => setShowConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => onDelete(routine.id)}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
