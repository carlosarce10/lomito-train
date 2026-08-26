import { mdiThemeLightDark, mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import Icon from '@mdi/react';

import useTheme from '@theme/useTheme';

import './ThemePicker.scss';

const OPCIONES = [
  { id: 'system', label: 'El del sistema', icon: mdiThemeLightDark },
  { id: 'light', label: 'Claro', icon: mdiWeatherSunny },
  { id: 'dark', label: 'Oscuro', icon: mdiWeatherNight },
];

/** Selector de tema con los tres estados visibles a la vez. */
export default function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="c-theme-picker">
      <legend className="c-theme-picker__legend">Tema</legend>
      <div className="c-theme-picker__options">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`c-theme-picker__option${theme === opcion.id ? ' is-selected' : ''}`}
            aria-pressed={theme === opcion.id}
            onClick={() => setTheme(opcion.id)}
          >
            <Icon path={opcion.icon} size={1} />
            {opcion.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
