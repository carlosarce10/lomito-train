import { useState } from 'react';

import { DEFAULT_ROUTINE_COLOR_ID, ROUTINE_COLORS } from '@domain/catalogs';
import Button from '@shared/components/Button/Button';

import './RoutineForm.scss';

export default function RoutineForm({ onSubmit, onCancel, initialData }) {
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
        <label className="c-routine-form__label" htmlFor="day-name">
          Nombre de la rutina
        </label>
        <input
          id="day-name"
          className="c-routine-form__input"
          type="text"
          placeholder="ej. Empuje, Piernas, Full Body…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
          maxLength={40}
        />
      </div>

      <fieldset className="c-routine-form__field">
        <legend className="c-routine-form__label">Color</legend>
        <div className="c-routine-form__colors">
          {ROUTINE_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={`c-routine-form__color-swatch${colorId === color.id ? ' c-routine-form__color-swatch is-active' : ''}`}
              style={{ '--swatch-color': color.value }}
              onClick={() => setColorId(color.id)}
              aria-pressed={colorId === color.id}
              aria-label={color.id}
            />
          ))}
        </div>
      </fieldset>

      <div className="c-routine-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          {initialData ? 'Guardar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
