import { dumpRaw } from '@domain/storage/driver';

import './RecoveryScreen.scss';

const MENSAJES = {
  unavailable: 'El navegador no permite guardar datos. Puede que estes en modo privado.',
  downgrade: 'Estos datos vienen de una version mas nueva de la aplicacion.',
  corrupt: 'Los datos guardados no se pueden leer.',
  quotaExceeded: 'No queda espacio de almacenamiento en el navegador.',
  render: 'Algo se rompio al dibujar la pantalla.',
};

/**
 * Pantalla de ultimo recurso cuando la aplicacion no puede arrancar con garantias.
 *
 * Lo importante no es el mensaje: es el boton de descarga. Ofrece el volcado crudo
 * del almacenamiento antes de que nadie toque nada, porque estos datos no estan en
 * ningun servidor y no hay forma de recuperarlos si se pierden aqui.
 */
export default function RecoveryScreen({ reason, detail }) {
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
    <div className="recovery">
      <div className="recovery__panel">
        <h1 className="recovery__title">No se pudo abrir Lomito Train</h1>
        <p className="recovery__message">{MENSAJES[reason] ?? MENSAJES.render}</p>
        <p className="recovery__hint">
          Tus datos siguen en el dispositivo. Descarga una copia antes de hacer nada mas.
        </p>
        <button className="recovery__action" type="button" onClick={descargar}>
          Descargar copia de seguridad
        </button>
        <button className="recovery__retry" type="button" onClick={() => window.location.reload()}>
          Reintentar
        </button>
        {detail && <pre className="recovery__detail">{String(detail)}</pre>}
      </div>
    </div>
  );
}
