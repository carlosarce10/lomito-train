import './SessionHistoryCard.scss';

const formatDate = (iso) =>
  new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

const formatDuration = (startedAt, endedAt) => {
  const ms = new Date(endedAt) - new Date(startedAt);
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
};

export default function SessionHistoryCard({ session, onDelete }) {
  const allSets = session.exercises.flatMap((ex) => ex.sets);
  const doneSets = allSets.filter((s) => s.done).length;
  const duration = session.endedAt
    ? formatDuration(session.startedAt, session.endedAt)
    : '—';

  return (
    <div className="session-history-card">
      <div className="session-history-card__header">
        <div className="session-history-card__title-row">
          <span
            className="session-history-card__dot"
            style={{ background: session.workoutDayColor }}
          />
          <span className="session-history-card__name">{session.workoutDayName}</span>
        </div>
        <span className="session-history-card__date">
          {formatDate(session.startedAt)}
        </span>
      </div>

      <div className="session-history-card__stats">
        <span className="session-history-card__stat">
          <span className="session-history-card__stat-icon">⏱</span>
          {duration}
        </span>
        <span className="session-history-card__stat">
          <span className="session-history-card__stat-icon">💪</span>
          {session.exercises.length} ejerc.
        </span>
        <span className="session-history-card__stat">
          <span className="session-history-card__stat-icon">✓</span>
          {doneSets}/{allSets.length} series
        </span>
      </div>

      <button
        className="session-history-card__delete"
        onClick={() => onDelete(session.id)}
        aria-label="Eliminar sesión"
      >
        🗑
      </button>
    </div>
  );
}
