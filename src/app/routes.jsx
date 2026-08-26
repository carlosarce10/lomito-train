import { Navigate } from 'react-router';

import { ExerciseDetailPage, ExercisesPage } from '@features/exercises';
import { RoutineDetailPage, RoutinesPage } from '@features/routines';
import { SettingsPage } from '@features/settings';

import AppShell from './AppShell/AppShell';

/**
 * Tabla de rutas. Es la unica fuente de verdad de que pantallas existen.
 *
 * Antes la navegacion eran dos useState de seleccion, asi que el boton atras del
 * movil salia de la aplicacion en lugar de volver al listado, un refresco perdia
 * donde estabas, y no habia forma de direccionar "exportar esta rutina", que es lo
 * que necesita la exportacion a PDF de la fase 8.
 */
export const routes = [
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: () => <Navigate to="/routines" replace /> },
      { path: 'routines', Component: RoutinesPage },
      { path: 'routines/:routineId', Component: RoutineDetailPage },
      { path: 'exercises', Component: ExercisesPage },
      { path: 'exercises/:exerciseId', Component: ExerciseDetailPage },
      { path: 'settings', Component: SettingsPage },
      { path: '*', Component: () => <Navigate to="/routines" replace /> },
    ],
  },
];
