import { useId } from 'react';

import './Field.scss';

/**
 * Campo de formulario con etiqueta, control y mensaje de error.
 *
 * Enlaza los tres por id: la etiqueta apunta al control, el control declara
 * aria-invalid y aria-describedby, y el mensaje es la region que describe el error.
 * Antes los formularios validaban en silencio y el usuario solo veia un boton
 * deshabilitado, sin saber por que.
 *
 * @param {object} props
 * @param {string} props.label Etiqueta visible.
 * @param {string} [props.hint] Texto auxiliar, por ejemplo "(opcional)".
 * @param {string} [props.error] Mensaje de error ya traducido. Si viene, marca invalido.
 * @param {(props: { id: string, 'aria-invalid': boolean|undefined,
 *                   'aria-describedby': string|undefined }) => import('react').ReactNode}
 *   props.children Recibe los atributos que debe aplicar al control.
 */
export default function Field({ label, hint, error, children }) {
  const id = useId();
  const idError = `${id}-error`;

  return (
    <div className="c-field">
      <label className="c-field__label" htmlFor={id}>
        {label}
        {hint && <span className="c-field__hint"> ({hint})</span>}
      </label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? idError : undefined,
      })}

      {/* La region existe siempre, tambien vacia: si apareciera y desapareciera del
          DOM, el lector de pantalla no anunciaria el cambio. */}
      <p className="c-field__error" id={idError} role="alert">
        {error ?? ''}
      </p>
    </div>
  );
}
