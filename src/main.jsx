import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { bootstrap } from './app/bootstrap/bootstrap';
import ErrorBoundary from './app/bootstrap/ErrorBoundary/ErrorBoundary';
import RecoveryScreen from './app/bootstrap/RecoveryScreen/RecoveryScreen';
import App from './App.jsx';

const arranque = bootstrap();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {arranque.ok ? (
      <ErrorBoundary
        fallback={(error) => <RecoveryScreen reason="render" detail={error.message} />}
      >
        <App />
      </ErrorBoundary>
    ) : (
      <RecoveryScreen reason={arranque.reason} detail={arranque.migration?.error?.message} />
    )}
  </StrictMode>,
);
