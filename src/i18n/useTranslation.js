import { useContext, useMemo } from 'react';

import { I18nContext } from './I18nContext';

/**
 * Acceso a las traducciones y a los formateadores del idioma activo.
 *
 * @param {string} [namespace] Espacio de nombres por defecto de las claves.
 * @returns {{ t: (clave: string, params?: object) => string,
 *             tn: (namespace: string, clave: string, params?: object) => string,
 *             language: string, setLanguage: (l: string) => void,
 *             formatNumber: Function, formatDate: Function, parseNumber: Function }}
 */
export default function useTranslation(namespace = 'common') {
  const contexto = useContext(I18nContext);
  if (!contexto) throw new Error('useTranslation necesita estar dentro de I18nProvider.');

  return useMemo(
    () => ({
      ...contexto,
      // t usa el namespace del hook; tn permite alcanzar otro sin cambiar de hook.
      t: (clave, params) => contexto.t(namespace, clave, params),
      tn: contexto.t,
    }),
    [contexto, namespace],
  );
}
