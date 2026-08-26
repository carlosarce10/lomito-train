import { useState } from 'react';

import { DEFAULT_ROUTINE_COLOR_ID, ROUTINE_COLORS } from '@domain/catalogs';
import { isDuplicateName } from '@domain/storage/integrity';
import { LIMITS } from '@domain/validation/limits';
import { normalizeText } from '@domain/validation/normalize';
import { text } from '@domain/validation/rules';
import Button from '@shared/components/Button/Button';
import Field from '@shared/components/Field/Field';
import useTranslation from '@i18n/useTranslation';

import './RoutineForm.scss';

// La misma regla que usa el esquema de rutina, para que el formulario y el almacen
// no puedan discrepar sobre que nombre es aceptable.
const nameRule = text(LIMITS.name);

/**
 * Formulario de creacion y edicion de una rutina: nombre y color.
 *
 * @param {object} props
 * @param {(datos: { name: string, colorId: string }) => void} props.onSubmit Recibe el
 *   nombre ya normalizado y el color elegido.
 * @param {() => void} props.onCancel Cierra el formulario sin guardar.
 * @param {{ id?: string, name?: string, colorId?: string }} [props.initialData] Rutina que
 *   se edita. Su id se excluye del aviso de duplicado, o el formulario se quejaria de si mismo.
 * @param {Array<{ id: string, name: string }>} [props.existingNames] Rutinas ya guardadas,
 *   para avisar de un nombre repetido.
 */
export default function RoutineForm({ onSubmit, onCancel, initialData, existingNames = [] }) {
  const { t, tn } = useTranslation('routines');
  const [name, setName] = useState(initialData?.name ?? '');
  const [colorId, setColorId] = useState(initialData?.colorId ?? DEFAULT_ROUTINE_COLOR_ID);
  // El error no aparece mientras se escribe por primera vez, porque regañaria al
  // usuario antes de que acabe: solo al salir del campo o al intentar enviar. Una
  // vez visible, se actualiza en vivo mientras corrige.
  const [nameTouched, setNameTouched] = useState(false);

  const nameIssue = nameRule(name);
  const nameError =
    nameTouched && nameIssue ? tn('validation', nameIssue.code, nameIssue.params) : null;

  // Dos rutinas con el mismo nombre son legitimas si el usuario insiste: se avisa,
  // pero no se bloquea el envio.
  const isDuplicated =
    nameTouched && !nameIssue && isDuplicateName(existingNames, name, initialData?.id ?? null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setNameTouched(true);
    if (nameIssue) return;
    onSubmit({ name: normalizeText(name), colorId });
  };

  return (
    <form className="c-routine-form" onSubmit={handleSubmit}>
      <Field label={t('form.nameLabel')} error={nameError}>
        {(fieldProps) => (
          <>
            <input
              {...fieldProps}
              className="c-routine-form__input"
              type="text"
              placeholder={t('form.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              data-autofocus
              maxLength={LIMITS.name.max}
            />
            {/* La region existe siempre, tambien vacia: un aviso que entra y sale del
                DOM no se anuncia. */}
            <p className="c-routine-form__warning" role="status">
              {isDuplicated ? tn('common', 'error.duplicateName') : ''}
            </p>
          </>
        )}
      </Field>

      <fieldset className="c-routine-form__field">
        <legend className="c-routine-form__label">{t('form.colorLabel')}</legend>
        <div className="c-routine-form__colors">
          {ROUTINE_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={`c-routine-form__color-swatch${colorId === color.id ? ' is-selected' : ''}`}
              style={{ '--swatch-color': color.value }}
              onClick={() => setColorId(color.id)}
              aria-pressed={colorId === color.id}
              aria-label={tn('catalog', `colors.${color.id}`)}
            />
          ))}
        </div>
      </fieldset>

      <div className="c-routine-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {tn('common', 'action.cancel')}
        </Button>
        {/* El boton no se deshabilita: enviar es lo que revela el error de un campo
            que el usuario todavia no ha tocado. */}
        <Button type="submit" variant="primary">
          {initialData ? tn('common', 'action.save') : tn('common', 'action.create')}
        </Button>
      </div>
    </form>
  );
}
