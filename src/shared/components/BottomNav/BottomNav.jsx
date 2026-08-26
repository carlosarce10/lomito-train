import Icon from '@mdi/react';
import { NavLink } from 'react-router';

import './BottomNav.scss';

/**
 * Barra de navegacion inferior.
 *
 * Recibe las pestanas como dato en lugar de declararlas dentro: shared no conoce
 * las rutas ni las features de la aplicacion.
 *
 * @param {object} props
 * @param {Array<{ to: string, label: string, icon: string }>} props.tabs
 */
export default function BottomNav({ tabs }) {
  return (
    <nav className="c-bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `c-bottom-nav__tab${isActive ? ' is-active' : ''}`}
        >
          <span className="c-bottom-nav__icon">
            <Icon path={tab.icon} size={1} />
          </span>
          <span className="c-bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
