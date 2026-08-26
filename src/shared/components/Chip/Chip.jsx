import './Chip.scss';

/**
 * Etiqueta compacta con una barra de color a la izquierda.
 *
 * Sustituye a las pastillas grandes de color solido: en el formulario de ejercicio
 * cinco pastillas rellenas ocupaban media pantalla, competian entre si por atencion
 * y obligaban a resolver el contraste del texto sobre cada color. Aqui el color es
 * una barra de cuatro pixeles y el texto siempre usa el token del tema, asi que se
 * lee igual en los dos temas y con cualquier color de catalogo.
 *
 * @param {object} props
 * @param {string} props.children Texto de la etiqueta.
 * @param {string} [props.color] Color del catalogo. Si falta, usa el acento.
 * @param {boolean} [props.selected] Estado activo, cuando es pulsable.
 * @param {'span'|'button'} [props.as] Etiqueta HTML. 'button' lo hace pulsable.
 */
export default function Chip({
  children,
  color,
  selected = false,
  as: Etiqueta = 'span',
  className = '',
  ...resto
}) {
  const clases = [
    'c-chip',
    color ? 'c-chip--color' : '',
    Etiqueta === 'button' ? 'c-chip--interactive' : '',
    selected ? 'is-selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Etiqueta
      className={clases}
      style={color ? { '--chip-color': color } : undefined}
      {...(Etiqueta === 'button' ? { type: 'button', 'aria-pressed': selected } : {})}
      {...resto}
    >
      {children}
    </Etiqueta>
  );
}
