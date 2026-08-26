import useTranslation from '@i18n/useTranslation';

import LanguagePicker from '../../components/LanguagePicker/LanguagePicker';
import ThemePicker from '../../components/ThemePicker/ThemePicker';

import './SettingsPage.scss';

/**
 * Ajustes de la aplicacion.
 *
 * El panel de datos entra en la fase 8; hasta entonces esta pantalla contiene solo
 * lo que ya funciona, no huecos vacios.
 */
export default function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div className="c-settings-page">
      <h2 className="c-settings-page__title">{t('title')}</h2>

      <section className="c-settings-page__section">
        <ThemePicker />
      </section>

      <section className="c-settings-page__section">
        <LanguagePicker />
      </section>
    </div>
  );
}
