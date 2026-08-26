import { mdiCalendarCheck, mdiCog, mdiDumbbell } from '@mdi/js';
import { Outlet } from 'react-router';

import Layout from '@shared/components/Layout/Layout';

import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

// Las pestanas viven aqui y no en shared: la barra de navegacion no tiene por que
// conocer las rutas de la aplicacion.
const TABS = [
  { to: '/routines', label: 'Rutinas', icon: mdiCalendarCheck },
  { to: '/exercises', label: 'Ejercicios', icon: mdiDumbbell },
  { to: '/settings', label: 'Ajustes', icon: mdiCog },
];

/**
 * Envoltura comun de todas las rutas: cabecera, contenido y barra de navegacion.
 * El contenido lo pone el enrutador en el Outlet.
 */
export default function AppShell() {
  return (
    <Layout tabs={TABS} headerAction={<ThemeToggle />}>
      <Outlet />
    </Layout>
  );
}
