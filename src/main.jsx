import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { runMigrations } from './shared/services/migrations';
import App from './App.jsx';

runMigrations();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
