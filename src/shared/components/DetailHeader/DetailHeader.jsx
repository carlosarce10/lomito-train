import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';

import './DetailHeader.scss';

/**
 * Cabecera comun de las pantallas de detalle.
 *
 * Existe porque habia dos patrones para la misma clase de pantalla: el detalle de
 * rutina volvia con "Rutinas" y ofrecia sus acciones como iconos circulares,
 * mientras el de ejercicio volvia con "Volver" y las ofrecia como botones de texto.
 * Dos formas de hacer lo mismo obligan al usuario a aprender la pantalla dos veces.
 *
 * El boton de volver nombra el destino y no la accion: "Rutinas" dice a donde se va,
 * "Volver" no dice nada.
 *
 * @param {object} props
 * @param {string} props.backLabel Nombre del destino, por ejemplo "Rutinas".
 * @param {() => void} props.onBack
 * @param {string} props.title Titulo de la pantalla.
 * @param {string} [props.accent] Color que identifica la pantalla. Pinta una barra
 *   junto al titulo en lugar de un punto suelto debajo, que no decia de que era.
 * @param {import('react').ReactNode} [props.meta] Linea de resumen bajo el titulo.
 * @param {import('react').ReactNode} [props.badges] Etiquetas bajo el titulo.
 * @param {import('react').ReactNode} [props.actions] Botones de accion, siempre iconos.
 */
export default function DetailHeader({ backLabel, onBack, title, accent, meta, badges, actions }) {
  return (
    <header className="c-detail-header">
      <div className="c-detail-header__bar">
        <button type="button" className="c-detail-header__back" onClick={onBack}>
          <Icon path={mdiArrowLeft} size={0.9} />
          {backLabel}
        </button>
        {actions && <div className="c-detail-header__actions">{actions}</div>}
      </div>

      {/* El h2 es el encabezado real de la pantalla. El h1 es el nombre de la
          aplicacion y no cambia, asi que sin esto un lector de pantalla no sabe
          en que seccion esta. */}
      <div className="c-detail-header__heading">
        {accent && (
          <span className="c-detail-header__accent" style={{ '--detail-accent': accent }} />
        )}
        <h2 className="c-detail-header__title">{title}</h2>
      </div>
      {meta && <p className="c-detail-header__meta">{meta}</p>}
      {badges && <div className="c-detail-header__badges">{badges}</div>}
    </header>
  );
}
