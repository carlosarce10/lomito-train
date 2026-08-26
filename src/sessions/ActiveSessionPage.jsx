import { useState } from 'react';
import useTimer from './hooks/useTimer';
import SessionExerciseCard from './components/SessionExerciseCard/SessionExerciseCard';
import Modal from '../shared/components/Modal/Modal';
import Button from '../shared/components/Button/Button';
import './ActiveSessionPage.scss';

export default function ActiveSessionPage({
  session,
  previousSession,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  onFinish,
  onCancel,
}) {
  const timer = useTimer(session.startedAt);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  // Build a map of exerciseId → previousSets for quick lookup
  const prevSetsMap = previousSession
    ? Object.fromEntries(
        previousSession.exercises.map((ex) => [ex.id, ex.sets])
      )
    : {};

  const doneSets = session.exercises.flatMap((ex) => ex.sets).filter((s) => s.done).length;
  const totalSets = session.exercises.flatMap((ex) => ex.sets).length;

  const handleFinish = () => {
    onFinish();
    setShowConfirmFinish(false);
  };

  const handleCancel = () => {
    onCancel();
    setShowConfirmCancel(false);
  };

  return (
    <div className="active-session">
      <div className="active-session__header-bar">
        <div className="active-session__info">
          <span
            className="active-session__dot"
            style={{ background: session.workoutDayColor }}
          />
          <span className="active-session__day-name">{session.workoutDayName}</span>
        </div>
        <div className="active-session__meta">
          <span className="active-session__timer">⏱ {timer}</span>
          <span className="active-session__progress">
            {doneSets}/{totalSets}
          </span>
        </div>
      </div>

      <div className="active-session__progress-bar">
        <div
          className="active-session__progress-fill"
          style={{ width: totalSets > 0 ? `${(doneSets / totalSets) * 100}%` : '0%' }}
        />
      </div>

      <div className="active-session__exercises">
        {session.exercises.map((ex) => (
          <SessionExerciseCard
            key={ex.id}
            exercise={ex}
            previousSets={prevSetsMap[ex.id] ?? null}
            onUpdateSet={onUpdateSet}
            onAddSet={onAddSet}
            onDeleteSet={onDeleteSet}
          />
        ))}
      </div>

      <div className="active-session__actions">
        <Button variant="ghost" onClick={() => setShowConfirmCancel(true)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => setShowConfirmFinish(true)}>
          Finalizar sesión
        </Button>
      </div>

      <Modal
        isOpen={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        title="¿Finalizar sesión?"
      >
        <div className="active-session__confirm">
          <p className="active-session__confirm-text">
            Completaste <strong>{doneSets} de {totalSets} series</strong>.
            La sesión se guardará en tu historial.
          </p>
          <div className="active-session__confirm-actions">
            <Button variant="ghost" onClick={() => setShowConfirmFinish(false)}>
              Seguir entrenando
            </Button>
            <Button variant="primary" onClick={handleFinish}>
              Guardar sesión
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        title="¿Cancelar sesión?"
      >
        <div className="active-session__confirm">
          <p className="active-session__confirm-text">
            Se perderá el progreso de esta sesión. Esta acción no se puede deshacer.
          </p>
          <div className="active-session__confirm-actions">
            <Button variant="ghost" onClick={() => setShowConfirmCancel(false)}>
              Continuar
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Descartar sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
