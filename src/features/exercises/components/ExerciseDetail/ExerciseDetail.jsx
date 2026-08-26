import { mdiArrowLeft, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import Button from '@shared/components/Button/Button';
import Modal from '@shared/components/Modal/Modal';
import NumberField from '@shared/components/NumberField/NumberField';

import ExerciseForm from '../ExerciseForm/ExerciseForm';
import MuscleGroupBadgeList from '../MuscleGroupBadgeList/MuscleGroupBadgeList';
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

  // El valor llega crudo: lo valida el dominio y devuelve si lo acepto.
  const handleSetChange = (setId, field, raw) =>
    raw === '' ? { ok: true } : onUpdateSet(exercise.id, setId, { [field]: raw });

  return (
    <div className="c-exercise-detail">
      <div className="c-exercise-detail__top">
        <button className="c-exercise-detail__back" onClick={onClose}>
          <Icon path={mdiArrowLeft} size={0.9} />
          Volver
        </button>
        <div className="c-exercise-detail__actions-top">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className="c-exercise-detail__info">
        <h2 className="c-exercise-detail__name">{exercise.name}</h2>
        <MuscleGroupBadgeList groupIds={exercise.muscleGroupIds} />
      </div>

      <div className="c-exercise-detail__sets-section">
        <div className="c-exercise-detail__sets-header">
          <h3 className="c-exercise-detail__sets-title">Sets</h3>
          <Button size="sm" onClick={() => onAddSet(exercise.id)}>
            + Set
          </Button>
        </div>

        {exercise.sets.length === 0 ? (
          <p className="c-exercise-detail__sets-empty">
            Agrega un set para registrar peso y repeticiones
          </p>
        ) : (
          <div className="c-exercise-detail__sets-table">
            <div className="c-exercise-detail__sets-row exercise-detail__sets-row--header">
              <span className="c-exercise-detail__sets-cell exercise-detail__sets-cell--num">
                #
              </span>
              <span className="c-exercise-detail__sets-cell">Peso (kg)</span>
              <span className="c-exercise-detail__sets-cell">Reps</span>
              <span className="c-exercise-detail__sets-cell exercise-detail__sets-cell--action"></span>
            </div>
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="c-exercise-detail__sets-row">
                <span className="c-exercise-detail__sets-cell exercise-detail__sets-cell--num">
                  {index + 1}
                </span>
                <div className="c-exercise-detail__sets-cell">
                  <NumberField
                    className="c-exercise-detail__sets-input"
                    inputMode="decimal"
                    value={set.weight}
                    placeholder="0"
                    aria-label="Peso en kilos"
                    onCommit={(raw) => handleSetChange(set.id, 'weight', raw)}
                  />
                </div>
                <div className="c-exercise-detail__sets-cell">
                  <NumberField
                    className="c-exercise-detail__sets-input"
                    inputMode="numeric"
                    value={set.reps}
                    placeholder="0"
                    aria-label="Repeticiones"
                    onCommit={(raw) => handleSetChange(set.id, 'reps', raw)}
                  />
                </div>
                <div className="c-exercise-detail__sets-cell exercise-detail__sets-cell--action">
                  <button
                    className="c-exercise-detail__sets-delete"
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
        <div className="c-exercise-detail__confirm">
          <p className="c-exercise-detail__confirm-text">
            ¿Seguro que quieres eliminar <strong>{exercise.name}</strong>? Esta accion no se puede
            deshacer.
          </p>
          <div className="c-exercise-detail__confirm-actions">
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
