import { mdiThemeLightDark, mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import Icon from '@mdi/react';

import useTheme from '@theme/useTheme';
import useTranslation from '@i18n/useTranslation';

import './ThemePicker.scss';

// Solo id e icono: la etiqueta se resuelve en el render porque t() vive en el hook.
const OPTIONS = [
  { id: 'system', icon: mdiThemeLightDark },
  { id: 'light', icon: mdiWeatherSunny },
  { id: 'dark', icon: mdiWeatherNight },
];

/** Selector de tema con los tres estados visibles a la vez. */
export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('settings');

  return (
    <fieldset className="c-theme-picker">
      <legend className="c-theme-picker__legend">{t('theme.label')}</legend>
      <div className="c-theme-picker__options">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`c-theme-picker__option${theme === option.id ? ' is-selected' : ''}`}
            aria-pressed={theme === option.id}
            onClick={() => setTheme(option.id)}
          >
            <Icon path={option.icon} size={1} />
            {t(`theme.${option.id}`)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
