import Icon from '@mdi/react';

import './DetailAction.scss';

/**
 * Boton de accion de una cabecera de detalle. Siempre icono mas etiqueta accesible.
 *
 * @param {object} props
 * @param {string} props.icon Ruta del icono de Material Design Icons.
 * @param {string} props.label Etiqueta accesible; tambien se usa como title.
 * @param {'default'|'danger'} [props.tone]
 * @param {boolean} [props.busy] Deshabilita y marca aria-busy.
 */
export default function DetailAction({ icon, label, tone = 'default', busy = false, ...resto }) {
  return (
    <button
      type="button"
      className={`c-detail-action c-detail-action--${tone}`}
      aria-label={label}
      title={label}
      aria-busy={busy || undefined}
      disabled={busy || resto.disabled}
      {...resto}
    >
      <Icon path={icon} size={0.9} />
    </button>
  );
}
