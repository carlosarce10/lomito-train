// El sistema de estilos se importa ANTES que cualquier componente, y el orden
// importa de verdad: Vite inyecta el CSS de cada .scss co-locado en el orden en que
// se importa su modulo. Si un componente entra primero, el navegador ve un
// "@layer components" antes de que _layers.scss haya declarado el orden de las
// capas, y una capa ya creada no se puede reordenar: el reset acaba ganandole a los
// componentes y se pierde todo el espaciado. Verificado en pantalla.
//

import './styles/main.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';

import { registerServiceWorker } from '@services/pwa/serviceWorker';
import ToastProvider from '@shared/components/ToastProvider/ToastProvider';

import { bootstrap } from './app/bootstrap/bootstrap';
import ErrorBoundary from './app/bootstrap/ErrorBoundary/ErrorBoundary';
import RecoveryScreen from './app/bootstrap/RecoveryScreen/RecoveryScreen';
import { routes } from './app/routes';
import I18nProvider from './i18n/I18nProvider/I18nProvider';

// Se registra antes de decidir si la aplicacion arranca: aunque los datos esten
// corruptos y se muestre la pantalla de rescate, la siguiente apertura sin red
// tiene que poder llegar hasta ella.
registerServiceWorker();

const arranque = bootstrap();

// Enrutado por hash y no por historial: la aplicacion se sirve como estatico y un
// hosting sin reescrituras devolveria 404 al recargar en /routines/<id>.
const router = createHashRouter(routes);

// El proveedor de idioma envuelve tambien la pantalla de rescate, y no solo el
// enrutador: RecoveryScreen traduce sus textos, y useTranslation lanza si no
// encuentra el contexto. Puede ir aqui sin riesgo porque el proveedor solo lee los
// ajustes a traves del driver, que nunca lanza y cae a los valores por defecto.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      {arranque.ok ? (
        <ErrorBoundary
          fallback={(error) => <RecoveryScreen reason="render" detail={error.message} />}
        >
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ErrorBoundary>
      ) : (
        <RecoveryScreen reason={arranque.reason} detail={arranque.migration?.error?.message} />
      )}
    </I18nProvider>
  </StrictMode>,
);
