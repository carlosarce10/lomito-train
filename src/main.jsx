import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { runMigrations } from './shared/services/migrations';

runMigrations();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
