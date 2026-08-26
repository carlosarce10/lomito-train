import { useState } from 'react';

import Layout from '@shared/components/Layout/Layout';
import { ExercisesPage } from '@features/exercises';
import { RoutinesPage } from '@features/routines';

import './App.scss';

export default function App() {
  const [activePage, setActivePage] = useState('routines');

  const renderPage = () => {
    switch (activePage) {
      case 'exercises':
        return <ExercisesPage />;
      default:
        return <RoutinesPage />;
    }
  };

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </Layout>
  );
}
