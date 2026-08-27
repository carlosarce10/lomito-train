import { mdiCalendarCheck, mdiCog, mdiDumbbell } from '@mdi/js';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';

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
 * Sube el scroll al llegar a una vista nueva.
 *
 * Sin esto se llegaba a una pantalla con el scroll a mitad de la anterior. Se hace a
 * mano y no con el ScrollRestoration de react-router porque ese quedo inerte aqui,
 * verificado: no tomo el control del historial ni llamo a scrollTo ni una vez.
 *
 * Solo actua en navegaciones nuevas. En atras y adelante no toca nada, porque la
 * restauracion nativa del navegador ya devuelve la posicion que se tenia, y pisarla
 * con un scrollTo dejaria el boton atras siempre arriba.
 */
function ScrollReset() {
  const { pathname } = useLocation();
  const tipo = useNavigationType();

  useEffect(() => {
    if (tipo !== 'POP') window.scrollTo(0, 0);
  }, [pathname, tipo]);

  return null;
}

/**
 * Envoltura comun de todas las rutas: cabecera, contenido y barra de navegacion.
 * El contenido lo pone el enrutador en el Outlet.
 */
export default function AppShell() {
  const { t } = useTranslation('common');
  const tabs = TABS.map((tab) => ({ ...tab, label: t(`nav.${tab.id}`) }));

  return (
    <Layout tabs={tabs} headerAction={<ThemeToggle />}>
      <ScrollReset />
      <Outlet />
    </Layout>
  );
}
