import { mdiClose, mdiDelete, mdiPencil } from '@mdi/js';
import Icon from '@mdi/react';
import { useId, useRef, useState } from 'react';

import { LIMITS } from '@domain/validation/limits';
import { parseDecimal } from '@domain/validation/parseDecimal';
import Button from '@shared/components/Button/Button';
import DetailAction from '@shared/components/DetailHeader/DetailAction';
import DetailHeader from '@shared/components/DetailHeader/DetailHeader';
import Modal from '@shared/components/Modal/Modal';
import NumberField from '@shared/components/NumberField/NumberField';
import useUnit from '@shared/hooks/useUnit';
import useTranslation from '@i18n/useTranslation';

import ExerciseForm from '../ExerciseForm/ExerciseForm';
import MuscleGroupBadgeList from '../MuscleGroupBadgeList/MuscleGroupBadgeList';
import './ExerciseDetail.scss';

// El nombre del ejercicio va en negrita dentro de la frase de confirmacion. En vez
// de meter etiquetas HTML en la clave, se pide la frase sin interpolar y se parte
// por el hueco: asi la traduccion puede mover el nombre a donde su idioma lo ponga.
const NAME_SLOT = '{{name}}';

/**
 * Detalle de un ejercicio: cabecera, marcas y tabla de series editable.
 *
 * El error de una serie se pinta en su propia fila, con el codigo que devuelve el
 * dominio: NumberField ya revertia el valor rechazado, pero sin decir por que. El
 * aviso de escritura fallida lo emite la pantalla que inyecta las operaciones, en el
 * unico punto por el que pasan todas; aqui solo se lee el `ok` para decidir si la
 * interfaz puede avanzar.
 *
 * @param {object} props
 * @param {object} props.exercise Ejercicio a mostrar.
 * @param {Array<{ id: string, name: string }>} [props.existingNames] Ejercicios ya
 *   guardados, para que el formulario de edicion avise de un nombre repetido.
 */
export default function ExerciseDetail({
  exercise,
  existingNames = [],
  onClose,
  onUpdate,
  onDelete,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const { t, tn, formatNumber } = useTranslation('exercises');
  const { unit, toDisplay, toStorage } = useUnit();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Codigo de validacion por serie: { [setId]: { field, code } }. Se pinta junto a
  // la fila y no como aviso flotante porque NumberField confirma en cada pulsacion.
  const [setIssues, setSetIssues] = useState({});
  // Campos de los que el usuario ya salio: { [setId]: { weight, reps } }. Un error no
  // aparece mientras se escribe por primera vez, igual que en ExerciseForm: NumberField
  // confirma en cada pulsacion, y avisar en la segunda tecla regana antes de acabar.
  // Al salir del campo el aviso aparece, y desde entonces se actualiza en vivo.
  const [visitedFields, setVisitedFields] = useState({});
  // El usuario ya intento anadir una serie estando en el tope.
  const [capReached, setCapReached] = useState(false);
  const idBase = useId();
  // Borrar una fila destruye el elemento que tenia el foco y el navegador lo manda al
  // <body>: quien navega con teclado acaba al principio del documento. Para
  // devolverselo hay que poder alcanzar el boton de destino.
  const deleteButtons = useRef(new Map());
  const weightInputs = useRef(new Map());
  const addSetButton = useRef(null);

  const idError = (setId) => `${idBase}-${setId}-error`;
  const unitLabel = tn('common', `unit.${unit}`);

  // El campo muestra la unidad activa y el almacen guarda kilos, asi que el texto
  // confirmado se convierte antes de llegar al dominio. Un texto que no es un decimal
  // pasa tal cual: rechazarlo y decir por que sigue siendo trabajo del dominio.
  const aAlmacen = (raw) => {
    const numero = parseDecimal(raw);
    return numero === null ? raw : toStorage(numero);
  };

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

  const handleEditSubmit = (data) => {
    const resultado = onUpdate(exercise.id, data);
    // Si no se guardo, el modal se queda abierto: cerrarlo daria por bueno un exito
    // que no ocurrio y el usuario perderia lo que acababa de escribir.
    if (!resultado?.ok) return resultado;
    setIsEditing(false);
    return resultado;
  };

  const handleDelete = () => {
    // Solo se sale del detalle si el borrado se guardo de verdad.
    if (!onDelete(exercise.id)?.ok) return;
    onClose();
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

  const [confirmBefore, confirmAfter = ''] = t('detail.deleteConfirm').split(NAME_SLOT);
  // Modal trae 'Cerrar' escrito a mano en su valor por defecto: se le pasa siempre.
  const closeLabel = tn('common', 'action.close');

  return (
    <div className="c-exercise-detail">
      <DetailHeader
        backLabel={tn('common', 'nav.exercises')}
        onBack={onClose}
        title={exercise.name}
        badges={<MuscleGroupBadgeList groupIds={exercise.muscleGroupIds} />}
        actions={
          <>
            <DetailAction
              icon={mdiPencil}
              label={tn('common', 'action.edit')}
              onClick={() => setIsEditing(true)}
            />
            <DetailAction
              icon={mdiDelete}
              label={tn('common', 'action.delete')}
              tone="danger"
              onClick={() => setShowDeleteConfirm(true)}
            />
          </>
        }
      />

      <div className="c-exercise-detail__sets-section">
        <h3 className="c-exercise-detail__sets-title">{t('detail.setsTitle')}</h3>

        {/* El limite viene de LIMITS: si se escribiera aqui, el JSX y el dominio
            podrian discrepar y el boton no diria la verdad. */}
        {capReached && setsAtCap && (
          <p className="c-exercise-detail__sets-error" role="alert">
            {tn('validation', 'tooManyItems', { max: LIMITS.setsPerExercise.max })}
          </p>
        )}

        {exercise.sets.length === 0 ? (
          <p className="c-exercise-detail__sets-empty">{t('detail.setsEmpty')}</p>
        ) : (
          <div className="c-exercise-detail__sets-table">
            <div className="c-exercise-detail__sets-row c-exercise-detail__sets-row--header">
              <span className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--num">
                #
              </span>
              <span className="c-exercise-detail__sets-cell">
                {tn('common', 'field.weight', { unit: unitLabel })}
              </span>
              <span className="c-exercise-detail__sets-cell">{tn('common', 'field.reps')}</span>
              <span className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--action"></span>
            </div>
            {exercise.sets.map((set, index) => {
              const issue = issueVisible(set.id);

              return (
                // El focusout burbujea, asi que una sola escucha en la fila cubre sus
                // dos campos; data-field dice de cual se acaba de salir.
                <div
                  key={set.id}
                  className="c-exercise-detail__sets-row"
                  onBlur={(event) => marcarVisitado(set.id, event.target.dataset.field)}
                >
                  <span className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--num">
                    {formatNumber(index + 1, 'integer')}
                  </span>
                  <div className="c-exercise-detail__sets-cell">
                    <NumberField
                      inputRef={(nodo) => {
                        if (nodo) weightInputs.current.set(set.id, nodo);
                        else weightInputs.current.delete(set.id);
                      }}
                      className="c-exercise-detail__sets-input"
                      inputMode="decimal"
                      value={toDisplay(set.weight)}
                      placeholder="0"
                      data-field="weight"
                      aria-label={tn('common', 'field.weightAria', { unit: unitLabel })}
                      aria-invalid={issue?.field === 'weight' || undefined}
                      aria-describedby={issue?.field === 'weight' ? idError(set.id) : undefined}
                      onCommit={(raw) => handleSetChange(set.id, 'weight', raw)}
                    />
                  </div>
                  <div className="c-exercise-detail__sets-cell">
                    <NumberField
                      className="c-exercise-detail__sets-input"
                      inputMode="numeric"
                      value={set.reps}
                      placeholder="0"
                      data-field="reps"
                      aria-label={tn('common', 'field.repsAria')}
                      aria-invalid={issue?.field === 'reps' || undefined}
                      aria-describedby={issue?.field === 'reps' ? idError(set.id) : undefined}
                      onCommit={(raw) => handleSetChange(set.id, 'reps', raw)}
                    />
                  </div>
                  <div className="c-exercise-detail__sets-cell c-exercise-detail__sets-cell--action">
                    <button
                      ref={(nodo) => {
                        if (nodo) deleteButtons.current.set(set.id, nodo);
                        else deleteButtons.current.delete(set.id);
                      }}
                      className="c-exercise-detail__sets-delete"
                      onClick={() => handleDeleteSet(set.id)}
                      aria-label={t('detail.deleteSet')}
                    >
                      <Icon path={mdiClose} size={0.7} />
                    </button>
                  </div>
                  {/* NumberField ya revierte el valor rechazado al salir del campo;
                      esto es lo que faltaba: decir por que se revirtio. Aparece al
                      salir, no en la pulsacion que lo provoca. */}
                  {issue && (
                    <p className="c-exercise-detail__sets-error" id={idError(set.id)} role="alert">
                      {tn('validation', issue.code)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* El boton vive debajo de la lista y no en la cabecera de la seccion: el
            usuario acaba de anotar la ultima serie y lo siguiente que quiere esta
            justo bajo el pulgar, no arriba del todo. */}
        <Button
          ref={addSetButton}
          variant="ghost"
          className="c-exercise-detail__sets-add"
          onClick={handleAddSet}
          disabled={capReached}
        >
          {t('detail.addSet')}
        </Button>
      </div>

      {/* Modal editar ejercicio */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={t('form.editTitle')}
        closeLabel={closeLabel}
      >
        <ExerciseForm
          initialData={exercise}
          existingNames={existingNames}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('detail.deleteTitle')}
        closeLabel={closeLabel}
      >
        <div className="c-exercise-detail__confirm">
          <p className="c-exercise-detail__confirm-text">
            {confirmBefore}
            <strong>{exercise.name}</strong>
            {confirmAfter}
          </p>
          {/* El foco inicial va a Cancelar, la opcion segura: es la convencion en
              iOS y en Material, y evita confirmar un borrado con Enter por inercia. */}
          <div className="c-exercise-detail__confirm-actions">
            <Button data-autofocus variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              {tn('common', 'action.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {tn('common', 'action.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
