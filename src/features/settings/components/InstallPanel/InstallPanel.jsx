import { mdiCellphoneArrowDown, mdiDotsVertical, mdiExportVariant } from '@mdi/js';
import Icon from '@mdi/react';

import Button from '@shared/components/Button/Button';
import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';

import useInstallPrompt from '../../hooks/useInstallPrompt';

import './InstallPanel.scss';

/**
 * Instalacion de la aplicacion en el dispositivo.
 *
 * Donde el navegador ofrece dialogo (Chrome, Edge) hay un boton. Donde no, se
 * explica el camino: en iOS es Compartir y Anadir a pantalla de inicio, y no hay
 * forma de lanzarlo desde la pagina. Quien lo monta decide no pintarlo si la
 * aplicacion ya corre instalada.
 */
export default function InstallPanel() {
  const { t } = useTranslation('settings');
  const toast = useToast();
  const { state, ios, install } = useInstallPrompt();

  const alInstalar = async () => {
    const resultado = await install();
    if (!resultado.ok) toast.error(t('install.failed'));
  };

  return (
    <div className="c-install-panel">
      <h3 className="c-install-panel__title">{t('install.title')}</h3>
      <p className="c-install-panel__hint">{t('install.hint')}</p>

      {state === 'prompt' ? (
        <Button className="c-install-panel__button" onClick={alInstalar}>
          <Icon path={mdiCellphoneArrowDown} size={0.9} />
          {t('install.button')}
        </Button>
      ) : (
        <p className="c-install-panel__steps">
          <Icon
            className="c-install-panel__steps-icon"
            path={ios ? mdiExportVariant : mdiDotsVertical}
            size={0.9}
          />
          <span>{ios ? t('install.ios') : t('install.manual')}</span>
        </p>
      )}
    </div>
  );
}
