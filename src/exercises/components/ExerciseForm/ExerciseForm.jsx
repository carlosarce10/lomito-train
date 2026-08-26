import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import { MUSCLE_GROUPS } from '../../../muscle-groups/constants/muscleGroups';
import { EQUIPMENT_TYPES } from '../../constants/equipment';
import Button from '../../../shared/components/Button/Button';
import './ExerciseForm.scss';

export default function ExerciseForm({ onSubmit, initialData = null, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [categories, setCategories] = useState(
    initialData?.categories?.length
      ? initialData.categories
      : initialData?.muscleGroup
        ? [initialData.muscleGroup]
        : []
  );
  const [equipment, setEquipment] = useState(initialData?.equipment || '');

  const isEditing = !!initialData;
  const isValid = name.trim() && categories.length > 0;

  const toggleCategory = (id) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      muscleGroup: categories[0],
      categories,
      equipment,
    });
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
          autoFocus
          maxLength={60}
        />
      </div>

      <div className="exercise-form__field">
        <label className="exercise-form__label">
          Grupos musculares
          {categories.length > 0 && (
            <span className="exercise-form__label-count"> ({categories.length})</span>
          )}
        </label>
        <div className="exercise-form__group-options">
          {MUSCLE_GROUPS.map((group) => {
            const selected = categories.includes(group.id);
            return (
              <button
                key={group.id}
                type="button"
                className={`exercise-form__group-option${selected ? ' exercise-form__group-option--selected' : ''}`}
                style={selected ? { backgroundColor: group.color, borderColor: group.color } : {}}
                onClick={() => toggleCategory(group.id)}
              >
                {selected && <Icon path={mdiCheck} size={0.65} className="exercise-form__group-check" />}
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="exercise-form__field">
        <label className="exercise-form__label">
          Equipamiento
          <span className="exercise-form__label-count"> (opcional)</span>
        </label>
        <div className="exercise-form__equipment-options">
          {EQUIPMENT_TYPES.map((eq) => (
            <button
              key={eq.id}
              type="button"
              className={`exercise-form__equipment-option${equipment === eq.id ? ' exercise-form__equipment-option--selected' : ''}`}
              onClick={() => setEquipment((prev) => (prev === eq.id ? '' : eq.id))}
            >
              <span>{eq.icon}</span>
              {eq.label}
            </button>
          ))}
        </div>
      </div>

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
