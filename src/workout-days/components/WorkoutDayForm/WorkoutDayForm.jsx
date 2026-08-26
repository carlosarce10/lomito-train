import { useState } from 'react';

import Button from '@shared/components/Button/Button';

import { ROUTINE_COLOR_VALUES, DEFAULT_ROUTINE_COLOR } from '@/domain/catalogs';
import './WorkoutDayForm.scss';

export default function WorkoutDayForm({ onSubmit, onCancel, initialData }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [color, setColor] = useState(initialData?.color ?? DEFAULT_ROUTINE_COLOR);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
  };

  return (
    <form className="workout-day-form" onSubmit={handleSubmit}>
      <div className="workout-day-form__field">
        <label className="workout-day-form__label" htmlFor="day-name">
          Nombre de la rutina
        </label>
        <input
          id="day-name"
          className="workout-day-form__input"
          type="text"
          placeholder="ej. Empuje, Piernas, Full Body…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
          maxLength={40}
        />
      </div>

      <fieldset className="workout-day-form__field">
        <legend className="workout-day-form__label">Color</legend>
        <div className="workout-day-form__colors">
          {ROUTINE_COLOR_VALUES.map((c) => (
            <button
              key={c}
              type="button"
              className={`workout-day-form__color-swatch${color === c ? ' workout-day-form__color-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </fieldset>

      <div className="workout-day-form__actions">
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
