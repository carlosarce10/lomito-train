import { mdiChevronDown, mdiChevronUp, mdiClose, mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useId, useState, useRef } from 'react';

import { getRecord } from '@domain/model/records';
import { LIMITS } from '@domain/validation/limits';
import { parseDecimal } from '@domain/validation/parseDecimal';
import Chip from '@shared/components/Chip/Chip';
import NumberField from '@shared/components/NumberField/NumberField';
import useUnit from '@shared/hooks/useUnit';
import useTranslation from '@i18n/useTranslation';
import { MuscleGroupBadgeList } from '@features/exercises';

import './RoutineExerciseCard.scss';

const SWIPE_THRESHOLD = 72;

/**
 * Tarjeta de un ejercicio dentro de una rutina, con su marca y sus series.
 *
 * El error de una serie se pinta en su propia fila, con el codigo que devuelve el
 * dominio: NumberField ya revertia el valor rechazado, pero sin decir por que. El
 * aviso de escritura fallida lo emite la pantalla que inyecta las operaciones, en el
 * unico punto por el que pasan todas.
 */
export default function RoutineExerciseCard({
  exercise,
  onRemove,
  onEdit,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const { tn, formatNumber } = useTranslation('routines');
  const { unit, toDisplay, toStorage } = useUnit();
  const [collapsed, setCollapsed] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  // Codigo de validacion por serie: { [setId]: { field, code } }. Se pinta en la
  // fila y no como aviso flotante porque NumberField confirma en cada pulsacion.
  const [setIssues, setSetIssues] = useState({});
  // Campos de los que el usuario ya salio: { [setId]: { weight, reps } }. Un error no
  // aparece mientras se escribe por primera vez, igual que en ExerciseForm: NumberField
  // confirma en cada pulsacion, y avisar en la segunda tecla regana antes de acabar.
  // Al salir del campo el aviso aparece, y desde entonces se actualiza en vivo.
  const [visitedFields, setVisitedFields] = useState({});
  // El usuario ya intento anadir una serie estando en el tope.
  const [capReached, setCapReached] = useState(false);
  const idBase = useId();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontal = useRef(false);
  // Borrar una fila destruye el elemento que tenia el foco y el navegador lo manda al
  // <body>: quien navega con teclado acaba al principio del documento. Para
  // devolverselo hay que poder alcanzar el boton de destino.
  const deleteButtons = useRef(new Map());
  const weightInputs = useRef(new Map());
  const addSetButton = useRef(null);

  const record = getRecord(exercise.sets);
  const unitLabel = tn('common', `unit.${unit}`);

  // ── Deslizamiento ───────────────────────────────────────────
  // El deslizamiento es un atajo, no la unica via: las mismas dos acciones estan
  // en botones siempre visibles y alcanzables por teclado. Ver docs/validation.md.

  /** Devuelve la tarjeta a su sitio sin disparar ninguna accion. */
  const cancelarDeslizamiento = () => {
    setIsSwiping(false);
    isHorizontal.current = false;
    setTranslateX(0);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontal.current = false;
    // Se parte siempre de cero: si un gesto anterior acabo en touchcancel, la
    // tarjeta podia quedarse desplazada y el siguiente toque disparaba la accion.
    setTranslateX(0);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // La direccion se decide en el primer movimiento que pasa del umbral de ruido.
    if (!isHorizontal.current && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    if (!isHorizontal.current) isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    if (!isHorizontal.current) return;

    // Aqui habia un e.preventDefault() que no hacia nada: React registra touchmove
    // como pasivo, asi que la llamada se ignoraba y Chrome avisaba por consola. Lo
    // que de verdad impide el desplazamiento horizontal es touch-action: pan-y en
    // el SCSS, que ademas deja pasar el vertical, que es justo lo que se quiere.
    setTranslateX(Math.max(-120, Math.min(120, dx)));
  };

  const handleTouchEnd = () => {
    const recorrido = translateX;
    cancelarDeslizamiento();
    if (recorrido < -SWIPE_THRESHOLD) onRemove();
    else if (recorrido > SWIPE_THRESHOLD) onEdit();
  };

  // ── Series ──────────────────────────────────────────────────

  const idError = (setId) => `${idBase}-${setId}-error`;
  const idCapError = `${idBase}-cap-error`;

  const marcarIssue = (setId, field, code) =>
    setSetIssues((prev) =>
      prev[setId]?.code === code && prev[setId]?.field === field
        ? prev
        : { ...prev, [setId]: { field, code } },
    );

  const olvidarIssue = (setId) =>
    setSetIssues((prev) => {
      if (!(setId in prev)) return prev;
      const siguiente = { ...prev };
      delete siguiente[setId];
      return siguiente;
    });

  /** Anota que el usuario ya salio de ese campo: desde ahora su error si se ve. */
  const marcarVisitado = (setId, field) => {
    if (field !== 'weight' && field !== 'reps') return;
    setVisitedFields((prev) =>
      prev[setId]?.[field] ? prev : { ...prev, [setId]: { ...prev[setId], [field]: true } },
    );
  };

  /** El error de una serie solo se pinta si el campo que lo provoco ya se abandono. */
  const issueVisible = (setId) => {
    const issue = setIssues[setId];
    return issue && visitedFields[setId]?.[issue.field] ? issue : null;
  };

  // El campo muestra la unidad activa y el almacen guarda kilos, asi que el texto
  // confirmado se convierte antes de llegar al dominio. Un texto que no es un decimal
  // pasa tal cual: rechazarlo y decir por que sigue siendo trabajo del dominio.
  const aAlmacen = (raw) => {
    const numero = parseDecimal(raw);
    return numero === null ? raw : toStorage(numero);
  };

  // El valor llega crudo: lo valida el dominio y devuelve si lo acepto.
  const handleSetChange = (setId, field, raw) => {
    const valor = field === 'weight' ? aAlmacen(raw) : raw;
    const resultado =
      raw === '' ? { ok: true } : onUpdateSet(exercise.id, setId, { [field]: valor });

    // Un valor que el dominio rechaza vuelve con `issue`, y ese es el mensaje de la
    // fila. Una escritura que falla por almacenamiento no trae issue y no se pinta
    // aqui: la avisa la pantalla, que si puede hacerlo una sola vez.
    if (resultado?.ok) olvidarIssue(setId);
    else if (resultado?.issue) marcarIssue(setId, field, resultado.issue);

    return resultado;
  };

  /**
   * Lleva el foco al boton de borrado de la fila que ocupa el sitio de la eliminada,
   * o al de agregar serie si era la ultima.
   */
  const devolverFoco = (siguienteSerie) => {
    // Los dos destinos posibles ya estan montados y el repintado no los toca, solo
    // quita la fila borrada: el foco se puede mover en el mismo evento.
    const destino = siguienteSerie
      ? deleteButtons.current.get(siguienteSerie.id)
      : addSetButton.current;
    destino?.focus();
  };

  const handleDeleteSet = (setId) => {
    // El destino se calcula antes de escribir, mientras la lista todavia tiene la fila.
    const indice = exercise.sets.findIndex((serie) => serie.id === setId);
    const siguienteSerie = exercise.sets[indice + 1];

    if (!onDeleteSet(exercise.id, setId)?.ok) return;
    olvidarIssue(setId);
    setVisitedFields((prev) => {
      if (!(setId in prev)) return prev;
      const siguiente = { ...prev };
      delete siguiente[setId];
      return siguiente;
    });
    devolverFoco(siguienteSerie);
  };

  // El tope de series lo fija el dominio, no el JSX: al alcanzarlo, addSet no guardaba
  // nada y devolvia ok, asi que el boton parecia responder y no pasaba nada. Aqui se
  // avisa antes de escribir, y el resultado de la escritura se lee para no retirar el
  // aviso cuando la serie no llego a guardarse.
  const setsAtCap = exercise.sets.length >= LIMITS.setsPerExercise.max;

  const handleAddSet = () => {
    if (setsAtCap) {
      setCapReached(true);
      return;
    }
    const resultado = onAddSet(exercise.id);
    if (!resultado?.ok) return;
    setCapReached(false);

    // El foco va al peso de la serie nueva. Sin esto el teclado del movil se cerraba
    // al pulsar el boton y hacian falta dos toques mas para empezar a escribir, que
    // entre serie y serie es justo lo que sobra.
    if (resultado.set) {
      requestAnimationFrame(() => weightInputs.current.get(resultado.set.id)?.focus());
    }
  };

  const actionOpacity = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);
  const showDelete = translateX < -16;
  const showEdit = translateX > 16;

  return (
    <div className="c-routine-exercise-card">
      {/* ── Action backgrounds ── */}
      <div
        className="c-routine-exercise-card__bg c-routine-exercise-card__bg--edit"
        style={{ opacity: showEdit ? actionOpacity : 0 }}
      >
        <Icon path={mdiPencil} size={1} />
        <span>{tn('common', 'action.edit')}</span>
      </div>
      <div
        className="c-routine-exercise-card__bg c-routine-exercise-card__bg--delete"
        style={{ opacity: showDelete ? actionOpacity : 0 }}
      >
        <Icon path={mdiDelete} size={1} />
        <span>{tn('common', 'action.delete')}</span>
      </div>

      {/* ── Main card content ── */}
      <div
        className="c-routine-exercise-card__content"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={cancelarDeslizamiento}
      >
        {/* Header row */}
        <div className="c-routine-exercise-card__header">
          <div className="c-routine-exercise-card__title-row">
            <span className="c-routine-exercise-card__name">{exercise.name}</span>
            <button
              type="button"
              className="c-routine-exercise-card__toggle"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={tn('exercises', 'detail.setsTitle')}
              aria-expanded={!collapsed}
            >
              <Icon path={collapsed ? mdiChevronDown : mdiChevronUp} size={0.9} />
            </button>
          </div>

          <div className="c-routine-exercise-card__meta-row">
            <MuscleGroupBadgeList groupIds={exercise.muscleGroupIds} max={2} />
          </div>
        </div>

        {/* Record row */}
        <div className="c-routine-exercise-card__record">
          {record ? (
            <>
              <span className="c-routine-exercise-card__record-value">
                {formatNumber(toDisplay(record.weight), 'weight')} {unitLabel}
              </span>
              <span className="c-routine-exercise-card__record-sep">×</span>
              <span className="c-routine-exercise-card__record-value">
                {formatNumber(record.reps, 'reps')} {tn('common', 'unit.reps')}
              </span>
              <Chip className="c-routine-exercise-card__record-chip">
                {tn('exercises', 'record.label')}
              </Chip>
            </>
          ) : (
            <span className="c-routine-exercise-card__record-empty">
              {tn('exercises', 'record.empty')}
            </span>
          )}
        </div>

        {/* Collapsible sets section */}
        {!collapsed && (
          <div className="c-routine-exercise-card__sets">
            {exercise.sets.length === 0 ? (
              <p className="c-routine-exercise-card__sets-empty">
                {tn('exercises', 'detail.setsEmpty')}
              </p>
            ) : (
              <div className="c-routine-exercise-card__sets-table">
                <div className="c-routine-exercise-card__sets-head">
                  <span>#</span>
                  <span>{tn('common', 'field.weight', { unit: unitLabel })}</span>
                  <span>{tn('common', 'field.reps')}</span>
                  <span />
                </div>
                {exercise.sets.map((set, i) => {
                  const issue = issueVisible(set.id);

                  return (
                    // El focusout burbujea, asi que una sola escucha en la fila cubre
                    // sus dos campos; data-field dice de cual se acaba de salir.
                    <div
                      key={set.id}
                      className="c-routine-exercise-card__sets-row"
                      onBlur={(event) => marcarVisitado(set.id, event.target.dataset.field)}
                    >
                      <span className="c-routine-exercise-card__sets-num">
                        {formatNumber(i + 1, 'integer')}
                      </span>
                      <NumberField
                        inputRef={(nodo) => {
                          if (nodo) weightInputs.current.set(set.id, nodo);
                          else weightInputs.current.delete(set.id);
                        }}
                        className="c-routine-exercise-card__sets-input"
                        inputMode="decimal"
                        value={toDisplay(set.weight)}
                        placeholder="0"
                        data-field="weight"
                        aria-label={tn('common', 'field.weightAria', { unit: unitLabel })}
                        aria-invalid={issue?.field === 'weight' || undefined}
                        aria-describedby={issue?.field === 'weight' ? idError(set.id) : undefined}
                        onCommit={(raw) => handleSetChange(set.id, 'weight', raw)}
                      />
                      <NumberField
                        className="c-routine-exercise-card__sets-input"
                        inputMode="numeric"
                        value={set.reps}
                        placeholder="0"
                        data-field="reps"
                        aria-label={tn('common', 'field.repsAria')}
                        aria-invalid={issue?.field === 'reps' || undefined}
                        aria-describedby={issue?.field === 'reps' ? idError(set.id) : undefined}
                        onCommit={(raw) => handleSetChange(set.id, 'reps', raw)}
                      />
                      <button
                        ref={(nodo) => {
                          if (nodo) deleteButtons.current.set(set.id, nodo);
                          else deleteButtons.current.delete(set.id);
                        }}
                        className="c-routine-exercise-card__sets-del"
                        onClick={() => handleDeleteSet(set.id)}
                        aria-label={tn('exercises', 'detail.deleteSet')}
                      >
                        <Icon path={mdiClose} size={0.7} />
                      </button>
                      {/* NumberField ya revierte el valor rechazado al salir del
                          campo; esto es lo que faltaba: decir por que se revirtio.
                          Aparece al salir, no en la pulsacion que lo provoca. */}
                      {issue && (
                        <p
                          className="c-routine-exercise-card__sets-error"
                          id={idError(set.id)}
                          role="alert"
                        >
                          {tn('validation', issue.code)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Editar y quitar viven aqui y no en la cabecera: el gesto de deslizar
                es la via principal, y esta es la alternativa para teclado y lector
                de pantalla sin llenar la tarjeta de iconos. Ver docs/validation.md. */}
            <div className="c-routine-exercise-card__sets-actions">
              <button
                type="button"
                className="c-routine-exercise-card__sets-action"
                onClick={onEdit}
              >
                {tn('common', 'action.edit')}
              </button>
              <button
                type="button"
                className="c-routine-exercise-card__sets-action c-routine-exercise-card__sets-action--danger"
                onClick={onRemove}
              >
                {tn('routines', 'detail.removeTitle')}
              </button>
            </div>

            <button
              ref={addSetButton}
              className="c-routine-exercise-card__sets-add"
              onClick={handleAddSet}
              aria-describedby={capReached && setsAtCap ? idCapError : undefined}
            >
              <Icon path={mdiPlus} size={0.8} />
              {tn('exercises', 'detail.addSet')}
            </button>

            {/* El limite viene de LIMITS: si se escribiera aqui, el JSX y el dominio
                podrian discrepar y el boton no diria la verdad. */}
            {capReached && setsAtCap && (
              <p className="c-routine-exercise-card__sets-error" id={idCapError} role="alert">
                {tn('validation', 'tooManyItems', { max: LIMITS.setsPerExercise.max })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
