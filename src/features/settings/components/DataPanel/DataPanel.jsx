import { mdiDownload, mdiFileExcel, mdiUpload } from '@mdi/js';
import Icon from '@mdi/react';
import { useRef, useState } from 'react';

import { exercisesRepository, routinesRepository } from '@domain/storage/repositories';
import Modal from '@shared/components/Modal/Modal';
import useTranslation from '@i18n/useTranslation';

import useDataExport from '../../hooks/useDataExport';

import './DataPanel.scss';

/**
 * Descarga y restauracion de los datos del usuario.
 *
 * Existe porque no hay servidor: este panel es la unica copia de seguridad y la unica
 * via de llevar los datos a otro dispositivo. Ver docs/export.md.
 */
export default function DataPanel() {
  const { t, tn } = useTranslation('settings');
  const { trabajando, exportarExcel, exportarCsv, exportarCopia, importarCopia } = useDataExport();
  const inputRef = useRef(null);
  const [ficheroPendiente, setFicheroPendiente] = useState(null);

  const acciones = [
    { id: 'excel', icon: mdiFileExcel, onClick: exportarExcel },
    { id: 'csv', icon: mdiDownload, onClick: exportarCsv },
    { id: 'backup', icon: mdiDownload, onClick: exportarCopia },
  ];

  const alElegirFichero = (event) => {
    const file = event.target.files?.[0];
    // El input se limpia siempre: si no, elegir el mismo fichero dos veces seguidas
    // no dispara el evento y parece que la importacion no funciona.
    event.target.value = '';
    if (file) setFicheroPendiente(file);
  };

  const confirmarImportacion = async () => {
    const file = ficheroPendiente;
    setFicheroPendiente(null);
    if (file) await importarCopia(file);
  };

  return (
    <div className="c-data-panel">
      <h3 className="c-data-panel__title">{t('export.title')}</h3>
      <p className="c-data-panel__hint">{t('export.hint')}</p>

      <div className="c-data-panel__actions">
        {acciones.map((accion) => (
          <button
            key={accion.id}
            type="button"
            className="c-data-panel__action"
            onClick={accion.onClick}
            disabled={trabajando !== null}
          >
            <Icon path={accion.icon} size={1} />
            <span className="c-data-panel__action-body">
              <span className="c-data-panel__action-label">
                {trabajando === accion.id ? t('export.working') : t(`export.${accion.id}`)}
              </span>
              <span className="c-data-panel__action-hint">{t(`export.${accion.id}Hint`)}</span>
            </span>
          </button>
        ))}

        <button
          type="button"
          className="c-data-panel__action c-data-panel__action--danger"
          onClick={() => inputRef.current?.click()}
          disabled={trabajando !== null}
        >
          <Icon path={mdiUpload} size={1} />
          <span className="c-data-panel__action-body">
            <span className="c-data-panel__action-label">
              {trabajando === 'import' ? t('export.working') : t('export.import')}
            </span>
            <span className="c-data-panel__action-hint">{t('export.importHint')}</span>
          </span>
        </button>
      </div>

      {/* Fuera de la vista pero no oculto al lector: el boton de arriba es su etiqueta. */}
      <input
        ref={inputRef}
        className="u-visually-hidden"
        type="file"
        accept="application/json,.json"
        tabIndex={-1}
        aria-hidden="true"
        onChange={alElegirFichero}
      />

      <Modal
        isOpen={ficheroPendiente !== null}
        onClose={() => setFicheroPendiente(null)}
        title={t('export.importConfirmTitle')}
        closeLabel={tn('common', 'action.close')}
      >
        <div className="c-data-panel__confirm">
          <p>
            {t('export.importConfirmText', {
              exercises: exercisesRepository.getAll().length,
              routines: routinesRepository.getAll().length,
            })}
          </p>
          <div className="c-data-panel__confirm-actions">
            <button
              type="button"
              className="c-data-panel__confirm-cancel"
              onClick={() => setFicheroPendiente(null)}
            >
              {tn('common', 'action.cancel')}
            </button>
            <button
              type="button"
              className="c-data-panel__confirm-accept"
              onClick={confirmarImportacion}
            >
              {t('export.import')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
