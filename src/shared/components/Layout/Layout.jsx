import Icon from '@mdi/react';
import { mdiDumbbell } from '@mdi/js';
import BottomNav from '../BottomNav/BottomNav';
import './Layout.scss';

export default function Layout({ children, activePage, onPageChange }) {
  return (
    <div className="layout">
      <header className="layout__header">
        <h1 className="layout__logo">
          <span className="layout__logo-icon">
            <Icon path={mdiDumbbell} size={1.2} />
          </span>
          Lomito Train
        </h1>
      </header>
      <main className="layout__content">
        {children}
      </main>
      <BottomNav activePage={activePage} onPageChange={onPageChange} />
    </div>
  );
}
