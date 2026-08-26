import { useId } from 'react';

import './OptionGroup.scss';

/**
 * Grupo de opciones excluyentes, con radios nativos.
 *
 * Se usa radio y no un boton con aria-pressed a proposito. Un grupo de botones
 * marcados obliga al usuario de lector de pantalla a recorrerlos uno a uno con Tab y
 * no anuncia cuantos hay; un radiogroup nativo se recorre con las flechas, anuncia
 * "opcion 2 de 3" y expone el estado sin que haya que declararlo a mano. Es tambien
 * el unico patron que el navegador conoce sin ayuda.
 *
 * Los tres selectores de Ajustes (tema, idioma y unidad) usan este componente, para
 * que no haya tres formas distintas de elegir una cosa entre varias.
 *
 * @param {object} props
 * @param {string} props.legend Titulo del grupo.
 * @param {string} [props.hint] Texto auxiliar bajo el titulo.
 * @param {Array<{ id: string, label: string, icon?: string, lang?: string }>} props.options Opciones.
 * @param {string} props.value Id de la opcion activa.
 * @param {(id: string) => void} props.onChange
 * @param {(option: object) => import('react').ReactNode} [props.renderIcon] Pinta el icono.
 */
export default function OptionGroup({ legend, hint, options, value, onChange, renderIcon }) {
  const nombre = useId();
  const idPista = `${nombre}-hint`;

  return (
    <fieldset className="c-option-group">
      <legend className="c-option-group__legend">{legend}</legend>
      {hint && (
        <p className="c-option-group__hint" id={idPista}>
          {hint}
        </p>
      )}

      <div className="c-option-group__options">
        {options.map((option) => (
          <label
            key={option.id}
            className={`c-option-group__option${value === option.id ? ' is-selected' : ''}`}
          >
            <input
              className="c-option-group__input"
              type="radio"
              name={nombre}
              value={option.id}
              checked={value === option.id}
              aria-describedby={hint ? idPista : undefined}
              onChange={() => onChange(option.id)}
            />
            {renderIcon && <span className="c-option-group__icon">{renderIcon(option)}</span>}
            {/* `lang` solo lo declara quien lo necesita: una etiqueta escrita en un
                idioma distinto del de la pagina, como el selector de idioma. */}
            <span className="c-option-group__label" lang={option.lang}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
