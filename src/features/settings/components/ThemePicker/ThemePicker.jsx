import { mdiThemeLightDark, mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import Icon from '@mdi/react';

import OptionGroup from '@shared/components/OptionGroup/OptionGroup';
import useTheme from '@theme/useTheme';
import useTranslation from '@i18n/useTranslation';

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

  const options = OPTIONS.map((option) => ({ ...option, label: t(`theme.${option.id}`) }));

  return (
    <OptionGroup
      legend={t('theme.label')}
      options={options}
      value={theme}
      onChange={setTheme}
      renderIcon={(option) => <Icon path={option.icon} size={1} />}
    />
  );
}
