import ThemePicker from '../../components/ThemePicker/ThemePicker';

import './SettingsPage.scss';

/**
 * Ajustes de la aplicacion.
 *
 * El selector de idioma entra en la fase 6 y el panel de datos en la fase 8; hasta
 * entonces esta pantalla contiene solo lo que ya funciona, no huecos vacios.
 */
export default function SettingsPage() {
  return (
    <div className="c-settings-page">
      <h2 className="c-settings-page__title">Ajustes</h2>

      <section className="c-settings-page__section">
        <ThemePicker />
      </section>
    </div>
  );
}
