import { mdiDelete, mdiFilePdfBox, mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { getRoutineColor } from '@domain/catalogs';
import { resolveRoutineExercises } from '@domain/model/routine';
import Button from '@shared/components/Button/Button';
import DetailAction from '@shared/components/DetailHeader/DetailAction';
import DetailHeader from '@shared/components/DetailHeader/DetailHeader';
import Modal from '@shared/components/Modal/Modal';
import useToast from '@shared/components/ToastProvider/useToast';
import useLongPressReorder from '@shared/hooks/useLongPressReorder';
import useUnit from '@shared/hooks/useUnit';
import useTranslation from '@i18n/useTranslation';
import { ExerciseForm } from '@features/exercises';

import ExercisePicker from '../ExercisePicker/ExercisePicker';
import RoutineExerciseCard from '../RoutineExerciseCard/RoutineExerciseCard';
import RoutineForm from '../RoutineForm/RoutineForm';
import './RoutineDetail.scss';

// El nombre lo escribe el usuario y no se traduce. La frase se pide sin
// interpolar y se parte por el hueco: asi la traduccion decide donde va el nombre
// y la interfaz puede seguir destacandolo, como ya hace ExerciseDetail.
const NAME_SLOT = '{{name}}';

/** Parte una frase con hueco de nombre en las dos mitades que lo rodean. */
function splitAroundName(phrase) {
  const [before, after = ''] = phrase.split(NAME_SLOT);
  return [before, after];
}

/**
 * Detalle de una rutina: cabecera, exportacion a PDF y sus ejercicios con series.
 *
 * El aviso de escritura fallida lo emite la pantalla que inyecta las operaciones, en
 * el unico punto por el que pasan todas; aqui solo se lee el `ok` para decidir si la
 * interfaz puede avanzar, porque cerrar un formulario que no se guardo borra lo que el
 * usuario acababa de escribir.
 *
 * @param {object} props
 * @param {object} props.routine Rutina a mostrar.
 * @param {Array} props.allExercises Catalogo completo de ejercicios.
 * @param {Array<{ id: string, name: string }>} [props.existingNames] Rutinas ya
 *   guardadas, para que el formulario de edicion avise de un nombre repetido.
 */
export default function RoutineDetail({
  routine,
  allExercises,
  existingNames = [],
  onBack,
  onUpdate,
  onDelete,
  onAddExercise,
  onRemoveExercise,
  onReorderExercises,
  onUpdateExercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const { t, tn, formatDate } = useTranslation('routines');
  const [showPicker, setShowPicker] = useState(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [exportando, setExportando] = useState(false);
  const toast = useToast();
  const { unit, toDisplay } = useUnit();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [removingExerciseId, setRemovingExerciseId] = useState(null);

  const routineExercises = resolveRoutineExercises(routine, allExercises);

  // Linea de resumen bajo el nombre: cuantos ejercicios, cuantas series y cuando se
  // toco por ultima vez. Antes solo habia un punto de color, que no decia nada.
  const { dragIndex, overIndex, dragOffset, getHandlers } = useLongPressReorder(
    routineExercises.length,
    (desde, hasta) => onReorderExercises?.(routine.id, desde, hasta),
  );

  const totalSeries = routineExercises.reduce((suma, ex) => suma + ex.sets.length, 0);
  const resumen = [
    tn('exercises', 'count', { count: routineExercises.length }),
    tn('exercises', 'setCount', { count: totalSeries }),
  ].join(' · ');

  /**
   * Genera el PDF de esta rutina. El motor se importa aqui y no arriba para que sus
   * 130 kB no entren en el arranque de la aplicacion.
   *
   * Las etiquetas se resuelven en este lado: el servicio de PDF no conoce i18n.
   */
  const exportarPdf = async () => {
    setExportando(true);
    try {
      const { exportRoutinePdf } = await import('@services/pdf/routinePdf');
      const resultado = await exportRoutinePdf({
        routine,
        exercises: routineExercises.map((ex) => ({
          name: ex.name,
          muscleGroups: ex.muscleGroupIds.map((id) => tn('catalog', `muscleGroups.${id}`)),
          equipment: ex.equipmentId ? tn('catalog', `equipment.${ex.equipmentId}`) : '',
          sets: ex.sets.map((serie) => ({ ...serie, weight: toDisplay(serie.weight) })),
        })),
        labels: {
          appName: tn('common', 'app.name'),
          date: formatDate(new Date().toISOString(), 'date'),
          weight: tn('common', 'field.weight', { unit: tn('common', `unit.${unit}`) }),
          reps: tn('common', 'field.reps'),
          noSets: tn('exercises', 'detail.setsEmpty'),
        },
      });
      if (!resultado.ok) toast.error(tn('settings', 'export.failed'));
    } finally {
      setExportando(false);
    }
  };
  // Modal trae 'Cerrar' escrito a mano en su valor por defecto: se le pasa siempre.
  const closeLabel = tn('common', 'action.close');
  const [deleteBefore, deleteAfter] = splitAroundName(t('detail.deleteConfirm'));

  const handleToggleExercise = (exerciseId) => {
    if (routine.exerciseIds.includes(exerciseId)) {
      onRemoveExercise(routine.id, exerciseId);
    } else {
      onAddExercise(routine.id, exerciseId);
    }
  };

  // Si la escritura falla, el formulario se queda abierto con lo escrito: cerrarlo
  // borraria el nombre que el usuario acaba de teclear justo cuando no se guardo.
  const handleRoutineEditSubmit = (datos) => {
    if (!onUpdate(routine.id, datos)?.ok) return;
    setIsEditingRoutine(false);
  };

  const handleEditSubmit = (data) => {
    if (!onUpdateExercise(editingExercise.id, data)?.ok) return;
    setEditingExercise(null);
  };

  // Si el ejercicio sigue en la rutina porque la escritura fallo, la confirmacion se
  // queda abierta: cerrarla haria creer que se quito.
  const handleConfirmRemove = () => {
    if (!removingExerciseId) return;
    if (!onRemoveExercise(routine.id, removingExerciseId)?.ok) return;
    setRemovingExerciseId(null);
  };

  return (
    <div className="c-routine-detail">
      {/* Top bar */}
      <DetailHeader
        backLabel={tn('common', 'nav.routines')}
        onBack={onBack}
        title={routine.name}
        accent={getRoutineColor(routine.colorId)}
        meta={resumen}
        actions={
          <>
            {/* Exportar esta desactivado con la rutina vacia: un PDF sin ejercicios
                no le sirve a nadie, y es mejor que el boton lo diga que no que falle. */}
            <DetailAction
              icon={mdiFilePdfBox}
              label={tn('settings', 'export.pdf')}
              busy={exportando}
              disabled={routineExercises.length === 0}
              onClick={exportarPdf}
            />
            <DetailAction
              icon={mdiPencil}
              label={t('detail.editAction')}
              onClick={() => setIsEditingRoutine(true)}
            />
            <DetailAction
              icon={mdiDelete}
              label={t('detail.deleteAction')}
              tone="danger"
              onClick={() => setShowConfirmDelete(true)}
            />
          </>
        }
      />

      {/* Exercises section */}
      <div className="c-routine-detail__exercises-section">
        {/* Sin titulo de seccion: el conteo ya esta en la linea de resumen de la
            cabecera y repetirlo aqui era ruido. Solo queda la accion. */}
        <div className="c-routine-detail__exercises-header">
          <button
            className="c-routine-detail__add-btn"
            onClick={() => setShowPicker(true)}
            aria-label={t('detail.addExercise')}
          >
            <Icon path={mdiPlus} size={0.85} />
            {tn('common', 'action.add')}
          </button>
        </div>

        {routineExercises.length === 0 ? (
          <p className="c-routine-detail__empty">{t('detail.empty')}</p>
        ) : (
          <div className="c-routine-detail__exercise-list" role="list">
            <p className="c-routine-detail__swipe-hint">{t('detail.sortHint')}</p>
            {routineExercises.map((ex, indice) => (
              <div
                key={ex.id}
                className={[
                  'c-routine-detail__sortable',
                  dragIndex === indice ? 'is-active' : '',
                  dragIndex !== null && overIndex === indice && dragIndex !== indice
                    ? 'is-selected'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={dragIndex === indice ? { '--drag-offset': `${dragOffset}px` } : undefined}
                role="listitem"
                {...getHandlers(indice)}
              >
                <RoutineExerciseCard
                  exercise={ex}
                  onRemove={() => setRemovingExerciseId(ex.id)}
                  onEdit={() => setEditingExercise(ex)}
                  onAddSet={onAddSet}
                  onUpdateSet={onUpdateSet}
                  onDeleteSet={onDeleteSet}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise picker modal */}
      <Modal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        title={t('picker.title')}
        titleId="exercise-picker-title"
        closeLabel={closeLabel}
      >
        <ExercisePicker
          allExercises={allExercises}
          selectedIds={routine.exerciseIds}
          onToggle={handleToggleExercise}
          onClose={() => setShowPicker(false)}
        />
      </Modal>

      {/* Edit exercise modal */}
      <Modal
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        title={tn('exercises', 'form.editTitle')}
        closeLabel={closeLabel}
      >
        {editingExercise && (
          <ExerciseForm
            initialData={editingExercise}
            existingNames={allExercises}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingExercise(null)}
          />
        )}
      </Modal>

      {/* Confirm remove from routine modal */}
      <Modal
        isOpen={!!removingExerciseId}
        onClose={() => setRemovingExerciseId(null)}
        title={t('detail.removeTitle')}
        closeLabel={closeLabel}
      >
        {removingExerciseId &&
          (() => {
            const ex = allExercises.find((e) => e.id === removingExerciseId);
            const [removeBefore, removeAfter] = splitAroundName(t('detail.removeConfirm'));
            return (
              <div className="c-routine-detail__confirm">
                <p className="c-routine-detail__confirm-text">
                  {removeBefore}
                  <strong>{ex?.name}</strong>
                  {removeAfter}
                </p>
                {/* El foco inicial va a Cancelar, la opcion segura: es la convencion
                    en iOS y en Material, y evita confirmar por inercia con Enter. */}
                <div className="c-routine-detail__confirm-actions">
                  <Button
                    data-autofocus
                    variant="ghost"
                    onClick={() => setRemovingExerciseId(null)}
                  >
                    {tn('common', 'action.cancel')}
                  </Button>
                  <Button variant="danger" onClick={handleConfirmRemove}>
                    {tn('common', 'action.remove')}
                  </Button>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Editar la rutina: nombre y color */}
      <Modal
        isOpen={isEditingRoutine}
        onClose={() => setIsEditingRoutine(false)}
        title={t('form.editTitle')}
        closeLabel={closeLabel}
      >
        {/* La coleccion completa baja desde la pagina: sin ella el formulario no
            puede avisar de un nombre repetido al editar. */}
        <RoutineForm
          initialData={routine}
          existingNames={existingNames}
          onSubmit={handleRoutineEditSubmit}
          onCancel={() => setIsEditingRoutine(false)}
        />
      </Modal>

      {/* Confirm delete routine modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title={t('detail.deleteTitle')}
        closeLabel={closeLabel}
      >
        <div className="c-routine-detail__confirm">
          <p className="c-routine-detail__confirm-text">
            {deleteBefore}
            <strong>{routine.name}</strong>
            {deleteAfter}
          </p>
          {/* El foco inicial va a Cancelar, la opcion segura: es la convencion en
              iOS y en Material, y evita confirmar el borrado por inercia con Enter. */}
          <div className="c-routine-detail__confirm-actions">
            <Button data-autofocus variant="ghost" onClick={() => setShowConfirmDelete(false)}>
              {tn('common', 'action.cancel')}
            </Button>
            <Button variant="danger" onClick={() => onDelete(routine.id)}>
              {tn('common', 'action.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
