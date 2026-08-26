import { mdiCalendarCheck, mdiCog, mdiDumbbell } from '@mdi/js';
import { Outlet } from 'react-router';

import Layout from '@shared/components/Layout/Layout';
import useTranslation from '@i18n/useTranslation';

import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

// Las pestanas viven aqui y no en shared: la barra de navegacion no tiene por que
// conocer las rutas de la aplicacion. Guardan el id y no la etiqueta, porque a este
// nivel no hay hook y por tanto no hay traduccion disponible.
const TABS = [
  { id: 'routines', to: '/routines', icon: mdiCalendarCheck },
  { id: 'exercises', to: '/exercises', icon: mdiDumbbell },
  { id: 'settings', to: '/settings', icon: mdiCog },
];

/**
 * Envoltura comun de todas las rutas: cabecera, contenido y barra de navegacion.
 * El contenido lo pone el enrutador en el Outlet.
 */
export default function AppShell() {
  const { t } = useTranslation('common');
  const tabs = TABS.map((tab) => ({ ...tab, label: t(`nav.${tab.id}`) }));

  return (
    <Layout tabs={tabs} headerAction={<ThemeToggle />}>
      <Outlet />
    </Layout>
  );
}
