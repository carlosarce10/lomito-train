import { useState } from 'react';

/**
 * Campo numerico que conserva lo que el usuario esta escribiendo.
 *
 * Un input controlado por el numero guardado no deja teclear un separador decimal:
 * "22," no es un numero, no se guarda, y el siguiente render borra la coma. Aqui el
 * texto crudo vive en estado local mientras el campo tiene el foco, y fuera de el
 * manda el dato guardado. Ver docs/validation.md.
 *
 * @param {object} props
 * @param {number} props.value Valor guardado.
 * @param {(crudo: string) => { ok: boolean }} props.onCommit Recibe el texto crudo y
 *   devuelve si lo acepto, para poder revertir lo que no.
 * @param {string} [props.className]
 * @param {'decimal' | 'numeric'} [props.inputMode]
 */
export default function NumberField({
  value,
  onCommit,
  className = '',
  inputMode = 'decimal',
  ...resto
}) {
  // null significa "no se esta editando": entonces se muestra el valor guardado.
  const [borrador, setBorrador] = useState(null);
  const mostrado = borrador ?? formatear(value);

  const alEscribir = (event) => {
    const texto = event.target.value;
    setBorrador(texto);
    onCommit(texto);
  };

  const alSalir = () => {
    // Al soltar el borrador, la pantalla vuelve a reflejar lo que hay en el almacen,
    // asi que un valor rechazado se revierte solo.
    if (borrador !== null) onCommit(borrador);
    setBorrador(null);
  };

  return (
    <input
      className={className}
      type="text"
      inputMode={inputMode}
      value={mostrado}
      onChange={alEscribir}
      onFocus={() => setBorrador(formatear(value))}
      onBlur={alSalir}
      {...resto}
    />
  );
}

/** Un 0 se muestra vacio: es el valor por defecto, no un dato que el usuario puso. */
const formatear = (value) => (value ? String(value) : '');
