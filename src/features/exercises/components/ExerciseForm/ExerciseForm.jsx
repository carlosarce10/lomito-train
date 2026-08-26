import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { EQUIPMENT_TYPES, MUSCLE_GROUPS } from '@domain/catalogs';
import Button from '@shared/components/Button/Button';
import useTranslation from '@i18n/useTranslation';

import './ExerciseForm.scss';

export default function ExerciseForm({ onSubmit, initialData = null, onCancel }) {
  const { t, tn, formatNumber } = useTranslation('exercises');
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
    <form className="c-exercise-form" onSubmit={handleSubmit}>
      <div className="c-exercise-form__field">
        <label className="c-exercise-form__label" htmlFor="exercise-name">
          {t('form.nameLabel')}
        </label>
        <input
          id="exercise-name"
          className="c-exercise-form__input"
          type="text"
          placeholder={t('form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
          maxLength={60}
        />
      </div>

      <fieldset className="c-exercise-form__field">
        <legend className="c-exercise-form__label">
          {t('form.muscleGroupsLabel')}
          {muscleGroupIds.length > 0 && (
            <span className="c-exercise-form__label-count">
              {' '}
              ({formatNumber(muscleGroupIds.length, 'integer')})
            </span>
          )}
        </legend>
        <div className="c-exercise-form__group-options">
          {MUSCLE_GROUPS.map((group) => {
            const selected = muscleGroupIds.includes(group.id);
            return (
              <button
                key={group.id}
                type="button"
                className={`c-exercise-form__group-option${selected ? ' is-selected' : ''}`}
                style={selected ? { backgroundColor: group.color, borderColor: group.color } : {}}
                aria-pressed={selected}
                onClick={() => toggleMuscleGroup(group.id)}
              >
                {selected && (
                  <Icon path={mdiCheck} size={0.65} className="c-exercise-form__group-check" />
                )}
                {tn('catalog', `muscleGroups.${group.id}`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="c-exercise-form__field">
        <legend className="c-exercise-form__label">
          {t('form.equipmentLabel')}
          <span className="c-exercise-form__label-count"> ({t('form.optional')})</span>
        </legend>
        <div className="c-exercise-form__equipment-options">
          {EQUIPMENT_TYPES.map((eq) => (
            <button
              key={eq.id}
              type="button"
              className={`c-exercise-form__equipment-option${equipmentId === eq.id ? ' is-selected' : ''}`}
              aria-pressed={equipmentId === eq.id}
              onClick={() => setEquipmentId((prev) => (prev === eq.id ? null : eq.id))}
            >
              {tn('catalog', `equipment.${eq.id}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="c-exercise-form__actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {tn('common', 'action.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={!isValid}>
          {isEditing ? t('form.submitEdit') : t('form.submitCreate')}
        </Button>
      </div>
    </form>
  );
}
