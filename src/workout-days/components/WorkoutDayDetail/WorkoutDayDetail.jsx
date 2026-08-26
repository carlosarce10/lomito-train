import { mdiArrowLeft, mdiDelete, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import Button from '@shared/components/Button/Button';
import Modal from '@shared/components/Modal/Modal';

import ExerciseForm from '@/exercises/components/ExerciseForm/ExerciseForm';

import ExercisePicker from '../ExercisePicker/ExercisePicker';
import RoutineExerciseCard from '../RoutineExerciseCard/RoutineExerciseCard';
import './WorkoutDayDetail.scss';

export default function WorkoutDayDetail({
  day,
  allExercises,
  onBack,
  onDelete,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [removingExerciseId, setRemovingExerciseId] = useState(null);

  const dayExercises = day.exerciseIds
    .map((id) => allExercises.find((ex) => ex.id === id))
    .filter(Boolean);

  const handleToggleExercise = (exerciseId) => {
    if (day.exerciseIds.includes(exerciseId)) {
      onRemoveExercise(day.id, exerciseId);
    } else {
      onAddExercise(day.id, exerciseId);
    }
  };

  const handleEditSubmit = (data) => {
    onUpdateExercise(editingExercise.id, data);
    setEditingExercise(null);
  };

  const handleConfirmRemove = () => {
    if (removingExerciseId) {
      onRemoveExercise(day.id, removingExerciseId);
      setRemovingExerciseId(null);
    }
  };

  return (
    <div className="workout-day-detail">
      {/* Top bar */}
      <div className="workout-day-detail__top">
        <button className="workout-day-detail__back" onClick={onBack}>
          <Icon path={mdiArrowLeft} size={0.9} />
          Rutinas
        </button>
        <button
          className="workout-day-detail__delete"
          onClick={() => setShowConfirmDelete(true)}
          aria-label="Eliminar rutina"
        >
          <Icon path={mdiDelete} size={0.9} />
        </button>
      </div>

      {/* Routine info */}
      <div className="workout-day-detail__info">
        <span className="workout-day-detail__color-dot" style={{ background: day.color }} />
        <h2 className="workout-day-detail__name">{day.name}</h2>
      </div>

      {/* Exercises section */}
      <div className="workout-day-detail__exercises-section">
        <div className="workout-day-detail__exercises-header">
          <span className="workout-day-detail__exercises-title">
            Ejercicios ({dayExercises.length})
          </span>
          <button
            className="workout-day-detail__add-btn"
            onClick={() => setShowPicker(true)}
            aria-label="Agregar ejercicio"
          >
            <Icon path={mdiPlus} size={0.85} />
            Agregar
          </button>
        </div>

        {dayExercises.length === 0 ? (
          <p className="workout-day-detail__empty">
            Sin ejercicios. Agrega algunos con el botón de arriba.
          </p>
        ) : (
          <div className="workout-day-detail__exercise-list">
            <p className="workout-day-detail__swipe-hint">
              Desliza ← para quitar &nbsp;·&nbsp; → para editar
            </p>
            {dayExercises.map((ex) => (
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
          selectedIds={day.exerciseIds}
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
              <div className="workout-day-detail__confirm">
                <p className="workout-day-detail__confirm-text">
                  ¿Quitar <strong>{ex?.name}</strong> de esta rutina?
                </p>
                <div className="workout-day-detail__confirm-actions">
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

      {/* Confirm delete routine modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Eliminar rutina"
      >
        <div className="workout-day-detail__confirm">
          <p className="workout-day-detail__confirm-text">
            ¿Eliminar <strong>{day.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="workout-day-detail__confirm-actions">
            <Button variant="ghost" onClick={() => setShowConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => onDelete(day.id)}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
