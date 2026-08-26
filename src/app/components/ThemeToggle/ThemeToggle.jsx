import { mdiWeatherNight, mdiWeatherSunny, mdiThemeLightDark } from '@mdi/js';
import Icon from '@mdi/react';

import useTheme from '@theme/useTheme';
import useTranslation from '@i18n/useTranslation';

import './ThemeToggle.scss';

const ICONOS = {
  system: mdiThemeLightDark,
  light: mdiWeatherSunny,
  dark: mdiWeatherNight,
};

/**
 * Boton que rota entre los tres estados del tema: sistema, claro y oscuro.
 *
 * Vive en la cabecera hasta que exista la pagina de ajustes, para que el tema sea
 * alcanzable desde el primer dia: una funcion escrita y no conectada es deuda.
 */
export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const { t } = useTranslation('settings');

  const etiqueta = t('theme.toggle', { value: t(`theme.${theme}`) });

  return (
    <button
      type="button"
      className="c-theme-toggle o-control"
      onClick={cycleTheme}
      aria-label={etiqueta}
      title={etiqueta}
    >
      <Icon path={ICONOS[theme]} size={1} />
    </button>
  );
}
