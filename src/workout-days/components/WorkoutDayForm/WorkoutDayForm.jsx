import { useState } from 'react';
import { WORKOUT_DAY_COLORS, DEFAULT_COLOR } from '../../constants/workoutDayColors';
import Button from '../../../shared/components/Button/Button';
import './WorkoutDayForm.scss';

export default function WorkoutDayForm({ onSubmit, onCancel, initialData }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [color, setColor] = useState(initialData?.color ?? DEFAULT_COLOR);

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
          autoFocus
          maxLength={40}
        />
      </div>

      <div className="workout-day-form__field">
        <label className="workout-day-form__label">Color</label>
        <div className="workout-day-form__colors">
          {WORKOUT_DAY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`workout-day-form__color-swatch${color === c ? ' workout-day-form__color-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

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
