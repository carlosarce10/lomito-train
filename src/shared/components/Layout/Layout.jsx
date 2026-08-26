import { mdiDumbbell } from '@mdi/js';
import Icon from '@mdi/react';

import BottomNav from '../BottomNav/BottomNav';

import './Layout.scss';

/**
 * Estructura comun de la aplicacion: cabecera, contenido y barra inferior.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido de la ruta activa.
 * @param {Array} props.tabs Pestanas de la barra inferior.
 * @param {import('react').ReactNode} [props.headerAction] Control a la derecha del titulo.
 */
export default function Layout({ children, tabs, headerAction }) {
  return (
    <div className="c-layout">
      <header className="c-layout__header">
        <h1 className="c-layout__logo">
          <span className="c-layout__logo-icon">
            <Icon path={mdiDumbbell} size={1.2} />
          </span>
          Lomito Train
        </h1>
        {headerAction}
      </header>
      <main className="c-layout__content">{children}</main>
      <BottomNav tabs={tabs} />
    </div>
  );
}
