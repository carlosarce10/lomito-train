import './Button.scss';

/**
 * Boton de la aplicacion.
 *
 * El `type` por defecto es 'button' y no 'submit', que es lo que hace el navegador
 * cuando el atributo falta o es invalido. Esto no es teorico: un renombrado masivo
 * de clases dejo aqui type="c-button", que segun la especificacion HTML cae a
 * submit, y el boton Cancelar de un formulario de edicion pasaba a guardar. No se
 * manifestaba solo porque el onClick desmontaba el modal antes, que es una
 * casualidad de tiempos, no un diseno.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido.
 * @param {'primary'|'danger'|'ghost'|'icon'} [props.variant] Aspecto.
 * @param {'sm'|'md'|'lg'} [props.size] Tamano.
 * @param {'button'|'submit'|'reset'} [props.type] Tipo HTML. Por defecto 'button'.
 * @param {boolean} [props.busy] Marca el boton como ocupado y lo deshabilita.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  busy = false,
  className = '',
  ...resto
}) {
  const inactivo = disabled || busy;
  const classes = ['c-button', `c-button--${variant}`, `c-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      type={type}
      disabled={inactivo}
      aria-busy={busy || undefined}
      {...resto}
    >
      {children}
    </button>
  );
}
