import useTranslation from '@i18n/useTranslation';

import DataPanel from '../../components/DataPanel/DataPanel';
import InstallPanel from '../../components/InstallPanel/InstallPanel';
import LanguagePicker from '../../components/LanguagePicker/LanguagePicker';
import ThemePicker from '../../components/ThemePicker/ThemePicker';
import UnitPicker from '../../components/UnitPicker/UnitPicker';
import useInstallPrompt from '../../hooks/useInstallPrompt';

import './SettingsPage.scss';

/**
 * Ajustes de la aplicacion.
 *
 * Tema, idioma, unidad de peso y datos. El panel de datos es lo mas importante de
 * esta pantalla: sin servidor, es la unica copia de seguridad que existe.
 */
export default function SettingsPage() {
  const { t } = useTranslation('settings');
  // La seccion desaparece entera cuando ya corre instalada: una tarjeta vacia
  // seria peor que ninguna.
  const { state: installState } = useInstallPrompt();

  return (
    <div className="c-settings-page">
      <h2 className="c-settings-page__title">{t('title')}</h2>

      <section className="c-settings-page__section">
        <ThemePicker />
      </section>

      <section className="c-settings-page__section">
        <LanguagePicker />
      </section>

      <section className="c-settings-page__section">
        <UnitPicker />
      </section>

      <section className="c-settings-page__section">
        <DataPanel />
      </section>

      {installState !== 'installed' && (
        <section className="c-settings-page__section">
          <InstallPanel />
        </section>
      )}
    </div>
  );
}
