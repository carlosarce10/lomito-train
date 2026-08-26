import { mdiArrowLeft, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import MuscleGroupBadge from '../../../muscle-groups/components/MuscleGroupBadge/MuscleGroupBadge';
import Button from '../../../shared/components/Button/Button';
import Modal from '../../../shared/components/Modal/Modal';
import ExerciseForm from '../ExerciseForm/ExerciseForm';
import './ExerciseDetail.scss';

export default function ExerciseDetail({
  exercise,
  onClose,
  onUpdate,
  onDelete,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
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

  const handleSetChange = (setId, field, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    onUpdateSet(exercise.id, setId, { [field]: numValue });
  };

  return (
    <div className="exercise-detail">
      <div className="exercise-detail__top">
        <button className="exercise-detail__back" onClick={onClose}>
          <Icon path={mdiArrowLeft} size={0.9} />
          Volver
        </button>
        <div className="exercise-detail__actions-top">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className="exercise-detail__info">
        <h2 className="exercise-detail__name">{exercise.name}</h2>
        <MuscleGroupBadge groupId={exercise.muscleGroup} />
      </div>

      <div className="exercise-detail__sets-section">
        <div className="exercise-detail__sets-header">
          <h3 className="exercise-detail__sets-title">Sets</h3>
          <Button size="sm" onClick={() => onAddSet(exercise.id)}>
            + Set
          </Button>
        </div>

        {exercise.sets.length === 0 ? (
          <p className="exercise-detail__sets-empty">
            Agrega un set para registrar peso y repeticiones
          </p>
        ) : (
          <div className="exercise-detail__sets-table">
            <div className="exercise-detail__sets-row exercise-detail__sets-row--header">
              <span className="exercise-detail__sets-cell exercise-detail__sets-cell--num">#</span>
              <span className="exercise-detail__sets-cell">Peso (kg)</span>
              <span className="exercise-detail__sets-cell">Reps</span>
              <span className="exercise-detail__sets-cell exercise-detail__sets-cell--action"></span>
            </div>
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="exercise-detail__sets-row">
                <span className="exercise-detail__sets-cell exercise-detail__sets-cell--num">
                  {index + 1}
                </span>
                <div className="exercise-detail__sets-cell">
                  <input
                    className="exercise-detail__sets-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={set.weight || ''}
                    placeholder="0"
                    onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
                  />
                </div>
                <div className="exercise-detail__sets-cell">
                  <input
                    className="exercise-detail__sets-input"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={set.reps || ''}
                    placeholder="0"
                    onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
                  />
                </div>
                <div className="exercise-detail__sets-cell exercise-detail__sets-cell--action">
                  <button
                    className="exercise-detail__sets-delete"
                    onClick={() => onDeleteSet(exercise.id, set.id)}
                    aria-label="Eliminar set"
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
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar ejercicio">
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
        title="Eliminar ejercicio"
      >
        <div className="exercise-detail__confirm">
          <p className="exercise-detail__confirm-text">
            ¿Seguro que quieres eliminar <strong>{exercise.name}</strong>? Esta accion no se puede
            deshacer.
          </p>
          <div className="exercise-detail__confirm-actions">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
