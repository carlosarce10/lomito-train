import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { useId, useState } from 'react';

import { EQUIPMENT_TYPES, MUSCLE_GROUP_IDS, MUSCLE_GROUPS } from '@domain/catalogs';
import { isDuplicateName } from '@domain/storage/integrity';
import { LIMITS } from '@domain/validation/limits';
import { normalizeText } from '@domain/validation/normalize';
import { listOf, text } from '@domain/validation/rules';
import Button from '@shared/components/Button/Button';
import Field from '@shared/components/Field/Field';
import useTranslation from '@i18n/useTranslation';

import './ExerciseForm.scss';

// Las mismas reglas que el esquema aplica al guardar, construidas una sola vez. Si
// el formulario repitiera los limites por su cuenta, podria aceptar lo que el
// dominio rechaza despues y el usuario veria un fallo sin explicacion.
const validateName = text(LIMITS.name);
const validateMuscleGroups = listOf({
  valores: MUSCLE_GROUP_IDS,
  min: LIMITS.muscleGroupsPerExercise.min,
  max: LIMITS.muscleGroupsPerExercise.max,
});

/**
 * Formulario de creacion y edicion de un ejercicio.
 *
 * Dice por que un dato no vale en vez de limitarse a deshabilitar el boton: el
 * dominio devuelve codigos y aqui solo se traducen. El aviso de nombre repetido no
 * impide guardar, porque dos ejercicios homonimos son legitimos si el usuario
 * insiste. Llama a onSubmit con el ejercicio ya normalizado.
 *
 * @param {object} props
 * @param {(datos: object) => void} props.onSubmit Recibe { name, muscleGroupIds, equipmentId }.
 * @param {object|null} [props.initialData] Ejercicio a editar, o null para crear uno.
 * @param {() => void} [props.onCancel] Si falta, no se muestra el boton de cancelar.
 * @param {Array<{ id: string, name: string }>} [props.existingNames] Ejercicios ya
 *   guardados, para avisar de un nombre repetido. Vacio equivale a no comprobarlo.
 */
export default function ExerciseForm({
  onSubmit,
  initialData = null,
  onCancel,
  existingNames = [],
}) {
  const { t, tn, formatNumber } = useTranslation('exercises');
  const idMuscleGroupsError = useId();
  const [name, setName] = useState(initialData?.name || '');
  const [muscleGroupIds, setMuscleGroupIds] = useState(initialData?.muscleGroupIds ?? []);
  const [equipmentId, setEquipmentId] = useState(initialData?.equipmentId ?? null);
  // Un error no aparece mientras se escribe por primera vez: eso regana al usuario
  // antes de que acabe. Aparece al salir del campo o al intentar enviar, y desde
  // entonces se actualiza en vivo mientras corrige.
  const [nameVisited, setNameVisited] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEditing = !!initialData;

  const nameIssue = validateName(name);
  const muscleGroupsIssue = validateMuscleGroups(muscleGroupIds);
  const showNameIssue = nameVisited || submitAttempted;

  const nameError =
    showNameIssue && nameIssue ? tn('validation', nameIssue.code, nameIssue.params) : undefined;

  // Al editar se ignora el propio id, o el formulario se quejaria de si mismo.
  const duplicateWarning =
    showNameIssue && !nameIssue && isDuplicateName(existingNames, name, initialData?.id ?? null)
      ? tn('common', 'error.duplicateName')
      : null;

  // El grupo de grupos musculares no tiene un momento equivalente al salir del
  // campo, asi que su error solo aparece cuando el usuario intenta enviar.
  const muscleGroupsError =
    submitAttempted && muscleGroupsIssue
      ? tn('validation', muscleGroupsIssue.code, muscleGroupsIssue.params)
      : '';

  const toggleMuscleGroup = (id) => {
    setMuscleGroupIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // El boton ya no se deshabilita: intentar enviar es lo que revela los errores.
    setSubmitAttempted(true);
    // El duplicado no entra en esta condicion a proposito: avisa, no bloquea.
    if (nameIssue || muscleGroupsIssue) return;
    onSubmit({ name: normalizeText(name), muscleGroupIds, equipmentId });
  };

  return (
    <form className="c-exercise-form" onSubmit={handleSubmit} noValidate>
      <div className="c-exercise-form__field">
        <Field label={t('form.nameLabel')} error={nameError}>
          {(fieldProps) => (
            <input
              {...fieldProps}
              className="c-exercise-form__input"
              type="text"
              placeholder={t('form.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameVisited(true)}
              data-autofocus
              maxLength={LIMITS.name.max}
            />
          )}
        </Field>
        {duplicateWarning && (
          <p className="c-exercise-form__warning" role="status">
            {duplicateWarning}
          </p>
        )}
      </div>

      <fieldset
        className="c-exercise-form__field"
        aria-describedby={muscleGroupsError ? idMuscleGroupsError : undefined}
      >
        <legend className="c-exercise-form__label">
          {t('form.muscleGroupsLabel')}
          {muscleGroupIds.length > 0 && (
            <span className="c-exercise-form__label-count">
              {' '}
              ({formatNumber(muscleGroupIds.length, 'integer')})
            </span>
          )}
        </legend>
        <div className="c-exercise-form__group-options">
          {MUSCLE_GROUPS.map((group) => {
            const selected = muscleGroupIds.includes(group.id);
            return (
              <button
                key={group.id}
                type="button"
                className={`c-exercise-form__group-option${selected ? ' is-selected' : ''}`}
                style={{ '--group-color': group.color }}
                aria-pressed={selected}
                onClick={() => toggleMuscleGroup(group.id)}
              >
                {selected && (
                  <Icon path={mdiCheck} size={0.65} className="c-exercise-form__group-check" />
                )}
                {tn('catalog', `muscleGroups.${group.id}`)}
              </button>
            );
          })}
        </div>
        {/* La region existe siempre, tambien vacia: si apareciera y desapareciera
            del DOM, el lector de pantalla no anunciaria el cambio. */}
        <p className="c-exercise-form__error" id={idMuscleGroupsError} role="alert">
          {muscleGroupsError}
        </p>
      </fieldset>

      <fieldset className="c-exercise-form__field">
        <legend className="c-exercise-form__label">
          {t('form.equipmentLabel')}
          <span className="c-exercise-form__label-count"> ({t('form.optional')})</span>
        </legend>
        <div className="c-exercise-form__equipment-options">
          {EQUIPMENT_TYPES.map((eq) => (
            <button
              key={eq.id}
              type="button"
              className={`c-exercise-form__equipment-option${equipmentId === eq.id ? ' is-selected' : ''}`}
              aria-pressed={equipmentId === eq.id}
              onClick={() => setEquipmentId((prev) => (prev === eq.id ? null : eq.id))}
            >
              {tn('catalog', `equipment.${eq.id}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="c-exercise-form__actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {tn('common', 'action.cancel')}
          </Button>
        )}
        <Button type="submit">{isEditing ? t('form.submitEdit') : t('form.submitCreate')}</Button>
      </div>
    </form>
  );
}
