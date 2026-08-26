import { useState } from 'react';

import { DEFAULT_ROUTINE_COLOR_ID, ROUTINE_COLORS } from '@domain/catalogs';
import { LIMITS } from '@domain/validation/limits';
import Button from '@shared/components/Button/Button';
import useTranslation from '@i18n/useTranslation';

import './RoutineForm.scss';

/** Formulario de creacion y edicion de una rutina: nombre y color. */
export default function RoutineForm({ onSubmit, onCancel, initialData }) {
  const { t, tn } = useTranslation('routines');
  const [name, setName] = useState(initialData?.name ?? '');
  const [colorId, setColorId] = useState(initialData?.colorId ?? DEFAULT_ROUTINE_COLOR_ID);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), colorId });
  };

  return (
    <form className="c-routine-form" onSubmit={handleSubmit}>
      <div className="c-routine-form__field">
        <label className="c-routine-form__label" htmlFor="routine-name">
          {t('form.nameLabel')}
        </label>
        <input
          id="routine-name"
          className="c-routine-form__input"
          type="text"
          placeholder={t('form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
          maxLength={LIMITS.name.max}
        />
      </div>

      <fieldset className="c-routine-form__field">
        <legend className="c-routine-form__label">{t('form.colorLabel')}</legend>
        <div className="c-routine-form__colors">
          {ROUTINE_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={`c-routine-form__color-swatch${colorId === color.id ? ' is-active' : ''}`}
              style={{ '--swatch-color': color.value }}
              onClick={() => setColorId(color.id)}
              aria-pressed={colorId === color.id}
              aria-label={tn('catalog', `colors.${color.id}`)}
            />
          ))}
        </div>
      </fieldset>

      <div className="c-routine-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {tn('common', 'action.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          {initialData ? tn('common', 'action.save') : tn('common', 'action.create')}
        </Button>
      </div>
    </form>
  );
}
