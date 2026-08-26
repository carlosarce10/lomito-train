import useSessions from './hooks/useSessions';
import SessionHistoryCard from './components/SessionHistoryCard/SessionHistoryCard';
import './HistoryPage.scss';

export default function HistoryPage() {
  const { sessions, deleteSession } = useSessions();

  if (sessions.length === 0) {
    return (
      <div className="history-page history-page--empty">
        <p className="history-page__empty-icon">📊</p>
        <p className="history-page__empty-title">Sin sesiones aún</p>
        <p className="history-page__empty-text">
          Entrena y finaliza una sesión para verla aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-page__list">
        {sessions.map((session) => (
          <SessionHistoryCard
            key={session.id}
            session={session}
            onDelete={deleteSession}
          />
        ))}
      </div>
    </div>
  );
}
