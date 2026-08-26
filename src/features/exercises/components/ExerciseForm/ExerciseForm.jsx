import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { EQUIPMENT_TYPES, MUSCLE_GROUPS } from '@domain/catalogs';
import Button from '@shared/components/Button/Button';

import './ExerciseForm.scss';

export default function ExerciseForm({ onSubmit, initialData = null, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [muscleGroupIds, setMuscleGroupIds] = useState(initialData?.muscleGroupIds ?? []);
  const [equipmentId, setEquipmentId] = useState(initialData?.equipmentId ?? null);

  const isEditing = !!initialData;
  const isValid = name.trim() && muscleGroupIds.length > 0;

  const toggleMuscleGroup = (id) => {
    setMuscleGroupIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), muscleGroupIds, equipmentId });
  };

  return (
    <form className="exercise-form" onSubmit={handleSubmit}>
      <div className="exercise-form__field">
        <label className="exercise-form__label" htmlFor="exercise-name">
          Nombre del ejercicio
        </label>
        <input
          id="exercise-name"
          className="exercise-form__input"
          type="text"
          placeholder="Ej: Press de banca"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
          maxLength={60}
        />
      </div>

      <fieldset className="exercise-form__field">
        <legend className="exercise-form__label">
          Grupos musculares
          {muscleGroupIds.length > 0 && (
            <span className="exercise-form__label-count"> ({muscleGroupIds.length})</span>
          )}
        </legend>
        <div className="exercise-form__group-options">
          {MUSCLE_GROUPS.map((group) => {
            const selected = muscleGroupIds.includes(group.id);
            return (
              <button
                key={group.id}
                type="button"
                className={`exercise-form__group-option${selected ? ' exercise-form__group-option--selected' : ''}`}
                style={selected ? { backgroundColor: group.color, borderColor: group.color } : {}}
                aria-pressed={selected}
                onClick={() => toggleMuscleGroup(group.id)}
              >
                {selected && (
                  <Icon path={mdiCheck} size={0.65} className="exercise-form__group-check" />
                )}
                {group.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="exercise-form__field">
        <legend className="exercise-form__label">
          Equipamiento
          <span className="exercise-form__label-count"> (opcional)</span>
        </legend>
        <div className="exercise-form__equipment-options">
          {EQUIPMENT_TYPES.map((eq) => (
            <button
              key={eq.id}
              type="button"
              className={`exercise-form__equipment-option${equipmentId === eq.id ? ' exercise-form__equipment-option--selected' : ''}`}
              aria-pressed={equipmentId === eq.id}
              onClick={() => setEquipmentId((prev) => (prev === eq.id ? null : eq.id))}
            >
              {eq.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="exercise-form__actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={!isValid}>
          {isEditing ? 'Guardar cambios' : 'Crear ejercicio'}
        </Button>
      </div>
    </form>
  );
}
