import { useCallback } from 'react';
import useLocalStorage from '../../shared/hooks/useLocalStorage';

const KEY = 'lomito-train-sessions';

export default function useSessions() {
  const [sessions, setSessions] = useLocalStorage(KEY, []);

  const saveSession = useCallback((completedSession) => {
    setSessions((prev) => [completedSession, ...prev]);
  }, [setSessions]);

  const deleteSession = useCallback((id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, [setSessions]);

  return { sessions, saveSession, deleteSession };
}
