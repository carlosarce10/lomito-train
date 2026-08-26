import useTranslation from '@i18n/useTranslation';
import logoMark from '@/assets/logo-mark.png';

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
  const { t } = useTranslation('common');

  return (
    <div className="c-layout">
      <header className="c-layout__header">
        <h1 className="c-layout__logo">
          <img className="c-layout__logo-mark" src={logoMark} alt="" width="32" height="32" />
          {t('app.name')}
        </h1>
        {headerAction}
      </header>
      <main className="c-layout__content">{children}</main>
      <BottomNav tabs={tabs} />
    </div>
  );
}
