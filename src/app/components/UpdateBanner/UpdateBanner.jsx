import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useSyncExternalStore } from 'react';

import {
  acknowledgeOfflineReady,
  applyUpdate,
  dismissUpdate,
  getServiceWorkerState,
  subscribeServiceWorker,
} from '@services/pwa/serviceWorker';
import Button from '@shared/components/Button/Button';
import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';

import './UpdateBanner.scss';

/**
 * Aviso de que hay una version nueva esperando, con el boton que la activa.
 *
 * Va dentro del flujo de la pagina y no flotando: el aviso flotante ya lo ocupa el
 * toast, y dos capas fijas sobre la barra inferior se pisarian. Como el scroll
 * vuelve arriba en cada navegacion, se ve en cuanto se cambia de pantalla.
 *
 * Tambien confirma, una sola vez por instalacion, que la aplicacion ya abre sin
 * conexion. Eso si va por toast: es informacion, no pide nada.
 */
export default function UpdateBanner() {
  const { t } = useTranslation('common');
  const toast = useToast();
  const { needRefresh, offlineReady } = useSyncExternalStore(
    subscribeServiceWorker,
    getServiceWorkerState,
  );

  useEffect(() => {
    if (!offlineReady) return;
    toast.success(t('pwa.offlineReady'));
    acknowledgeOfflineReady();
  }, [offlineReady, toast, t]);

  if (!needRefresh) return null;

  return (
    <div className="c-update-banner" role="status">
      <p className="c-update-banner__text">{t('pwa.updateAvailable')}</p>
      <div className="c-update-banner__actions">
        <Button size="sm" className="c-update-banner__update" onClick={applyUpdate}>
          {t('pwa.update')}
        </Button>
        <button
          type="button"
          className="c-update-banner__dismiss o-control"
          onClick={dismissUpdate}
          aria-label={t('pwa.later')}
          title={t('pwa.later')}
        >
          <Icon path={mdiClose} size={1} />
        </button>
      </div>
    </div>
  );
}
