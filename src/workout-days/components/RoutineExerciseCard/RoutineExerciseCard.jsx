import { mdiChevronDown, mdiChevronUp, mdiDelete, mdiPencil, mdiPlus, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { useState, useRef } from 'react';

import MuscleGroupBadge from '@/muscle-groups/components/MuscleGroupBadge/MuscleGroupBadge';
import './RoutineExerciseCard.scss';

const SWIPE_THRESHOLD = 72;

function getRecord(sets) {
  if (!sets || sets.length === 0) return null;
  const maxWeight = Math.max(...sets.map((s) => s.weight));
  if (maxWeight === 0) return null;
  const recordSet = sets.find((s) => s.weight === maxWeight);
  return { weight: maxWeight, reps: recordSet?.reps ?? 0 };
}

export default function RoutineExerciseCard({
  exercise,
  onRemove,
  onEdit,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontal = useRef(false);

  const record = getRecord(exercise.sets);

  // ── Swipe handlers ──────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontal.current = false;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine scroll vs swipe direction on first move
    if (!isHorizontal.current && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    if (!isHorizontal.current) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontal.current) return;

    e.preventDefault();
    const clamped = Math.max(-120, Math.min(120, dx));
    setTranslateX(clamped);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (translateX < -SWIPE_THRESHOLD) {
      onRemove();
    } else if (translateX > SWIPE_THRESHOLD) {
      onEdit();
    }
    setTranslateX(0);
  };

  // ── Set input change ─────────────────────────────────────────
  const handleSetChange = (setId, field, value) => {
    const num = value === '' ? 0 : parseFloat(value);
    if (isNaN(num) || num < 0) return;
    onUpdateSet(exercise.id, setId, { [field]: num });
  };

  const actionOpacity = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);
  const showDelete = translateX < -16;
  const showEdit = translateX > 16;

  return (
    <div className="routine-ex-card">
      {/* ── Action backgrounds ── */}
      <div
        className="routine-ex-card__bg routine-ex-card__bg--edit"
        style={{ opacity: showEdit ? actionOpacity : 0 }}
      >
        <Icon path={mdiPencil} size={1} />
        <span>Editar</span>
      </div>
      <div
        className="routine-ex-card__bg routine-ex-card__bg--delete"
        style={{ opacity: showDelete ? actionOpacity : 0 }}
      >
        <Icon path={mdiDelete} size={1} />
        <span>Eliminar</span>
      </div>

      {/* ── Main card content ── */}
      <div
        className="routine-ex-card__content"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header row */}
        <div className="routine-ex-card__header">
          <div className="routine-ex-card__title-row">
            <span className="routine-ex-card__name">{exercise.name}</span>
            <MuscleGroupBadge groupId={exercise.muscleGroup} />
          </div>
          <button
            className="routine-ex-card__toggle"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Ver sets' : 'Ocultar sets'}
          >
            <Icon path={collapsed ? mdiChevronDown : mdiChevronUp} size={0.9} />
          </button>
        </div>

        {/* Record row */}
        <div className="routine-ex-card__record">
          {record ? (
            <>
              <span className="routine-ex-card__record-value">{record.weight} kg</span>
              <span className="routine-ex-card__record-sep">×</span>
              <span className="routine-ex-card__record-value">{record.reps} reps</span>
              <span className="routine-ex-card__record-label">récord</span>
            </>
          ) : (
            <span className="routine-ex-card__record-empty">Sin récord aún</span>
          )}
        </div>

        {/* Collapsible sets section */}
        {!collapsed && (
          <div className="routine-ex-card__sets">
            {exercise.sets.length === 0 ? (
              <p className="routine-ex-card__sets-empty">
                Sin sets. Agrega uno con el botón de abajo.
              </p>
            ) : (
              <div className="routine-ex-card__sets-table">
                <div className="routine-ex-card__sets-head">
                  <span>#</span>
                  <span>Peso (kg)</span>
                  <span>Reps</span>
                  <span />
                </div>
                {exercise.sets.map((set, i) => (
                  <div key={set.id} className="routine-ex-card__sets-row">
                    <span className="routine-ex-card__sets-num">{i + 1}</span>
                    <input
                      className="routine-ex-card__sets-input"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.5"
                      value={set.weight || ''}
                      placeholder="0"
                      onChange={(e) => handleSetChange(set.id, 'weight', e.target.value)}
                    />
                    <input
                      className="routine-ex-card__sets-input"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={set.reps || ''}
                      placeholder="0"
                      onChange={(e) => handleSetChange(set.id, 'reps', e.target.value)}
                    />
                    <button
                      className="routine-ex-card__sets-del"
                      onClick={() => onDeleteSet(exercise.id, set.id)}
                      aria-label="Eliminar set"
                    >
                      <Icon path={mdiClose} size={0.7} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button className="routine-ex-card__sets-add" onClick={() => onAddSet(exercise.id)}>
              <Icon path={mdiPlus} size={0.8} />
              Agregar set
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
