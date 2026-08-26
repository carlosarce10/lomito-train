import { mdiDumbbell } from '@mdi/js';
import Icon from '@mdi/react';

import BottomNav from '../BottomNav/BottomNav';
import './Layout.scss';

export default function Layout({ children, activePage, onPageChange, headerAction }) {
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
      <BottomNav activePage={activePage} onPageChange={onPageChange} />
    </div>
  );
}
