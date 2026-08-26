import { dumpRaw } from '@domain/storage/driver';
import useTranslation from '@i18n/useTranslation';

import './RecoveryScreen.scss';

// Razones con mensaje propio en common.recovery. Cualquier otra cae en render, para
// que la pantalla nunca muestre una clave sin traducir.
const REASONS = ['unavailable', 'downgrade', 'corrupt', 'quotaExceeded', 'render'];

/**
 * Pantalla de ultimo recurso cuando la aplicacion no puede arrancar con garantias.
 *
 * Lo importante no es el mensaje: es el boton de descarga. Ofrece el volcado crudo
 * del almacenamiento antes de que nadie toque nada, porque estos datos no estan en
 * ningun servidor y no hay forma de recuperarlos si se pierden aqui.
 */
export default function RecoveryScreen({ reason, detail }) {
  const { t } = useTranslation('common');
  const razon = REASONS.includes(reason) ? reason : 'render';

  const descargar = () => {
    const contenido = JSON.stringify(
      { exportedAt: new Date().toISOString(), reason, raw: dumpRaw() },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `lomito-train_rescate_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    // Revocar de forma sincrona cancela la descarga en algunos navegadores.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="c-recovery-screen">
      <div className="c-recovery-screen__panel">
        <h1 className="c-recovery-screen__title">{t('recovery.title')}</h1>
        <p className="c-recovery-screen__message">{t(`recovery.${razon}`)}</p>
        <p className="c-recovery-screen__hint">{t('recovery.hint')}</p>
        <button className="c-recovery-screen__action" type="button" onClick={descargar}>
          {t('recovery.download')}
        </button>
        <button
          className="c-recovery-screen__retry"
          type="button"
          onClick={() => window.location.reload()}
        >
          {t('action.retry')}
        </button>
        {detail && <pre className="c-recovery-screen__detail">{String(detail)}</pre>}
      </div>
    </div>
  );
}
