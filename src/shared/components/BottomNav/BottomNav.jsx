import { mdiDumbbell, mdiCalendarCheck } from '@mdi/js';
import Icon from '@mdi/react';
import './BottomNav.scss';

const TABS = [
  { id: 'routines', label: 'Rutinas', icon: mdiCalendarCheck },
  { id: 'exercises', label: 'Ejercicios', icon: mdiDumbbell },
];

export default function BottomNav({ activePage, onPageChange }) {
  return (
    <nav className="c-bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`c-bottom-nav__tab${activePage === tab.id ? ' bottom-nav__tab--active' : ''}`}
          onClick={() => onPageChange(tab.id)}
          aria-current={activePage === tab.id ? 'page' : undefined}
        >
          <span className="c-bottom-nav__icon">
            <Icon path={tab.icon} size={1} />
          </span>
          <span className="c-bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
