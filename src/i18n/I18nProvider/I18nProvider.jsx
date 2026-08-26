import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { settingsRepository } from '@domain/storage/repositories';

import { CATALOGS } from '../catalogs';
import { FALLBACK_LANGUAGE, isLanguage } from '../config';
import { detectLanguage } from '../detectLanguage';
import {
  formatDate,
  formatNumber,
  formatRelative,
  parseLocalizedNumber,
  pluralCategory,
} from '../format';
import { I18nContext } from '../I18nContext';

/**
 * Provee el idioma activo y la funcion de traduccion a todo el arbol.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export default function I18nProvider({ children }) {
  const { store } = settingsRepository;
  const settings = useSyncExternalStore(store.subscribe, store.getSnapshot);

  // Si el usuario no ha elegido, se detecta; su eleccion, una vez hecha, manda.
  const language = isLanguage(settings.language)
    ? settings.language
    : detectLanguage(settings.language);

  // El atributo lang del documento sigue al idioma activo. Sin esto, un lector de
  // pantalla lee el ingles con fonetica espanola.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((siguiente) => {
    if (isLanguage(siguiente)) settingsRepository.patch({ language: siguiente });
  }, []);

  const valor = useMemo(() => {
    /**
     * Resuelve una clave con notacion de puntos dentro de un namespace.
     * Cae al idioma de respaldo antes de devolver la clave cruda.
     */
    const resolver = (namespace, clave) =>
      buscar(CATALOGS[language]?.[namespace], clave) ??
      buscar(CATALOGS[FALLBACK_LANGUAGE]?.[namespace], clave) ??
      null;

    /**
     * Traduce una clave. Con `count` elige la forma plural via Intl.PluralRules.
     * Interpola {{variables}}.
     */
    const t = (namespace, clave, params = {}) => {
      let plantilla = null;

      if (typeof params.count === 'number') {
        const categoria = pluralCategory(params.count, language);
        plantilla = resolver(namespace, `${clave}_${categoria}`) ?? resolver(namespace, clave);
      } else {
        plantilla = resolver(namespace, clave);
      }

      // Devolver la clave y no una cadena vacia es deliberado: una traduccion que
      // falta tiene que verse, no desaparecer de la pantalla.
      if (plantilla === null) return `${namespace}.${clave}`;

      return plantilla.replace(/\{\{(\w+)\}\}/g, (_, nombre) =>
        nombre in params ? String(params[nombre]) : `{{${nombre}}}`,
      );
    };

    return {
      language,
      setLanguage,
      t,
      formatNumber: (valor, preset) => formatNumber(valor, preset, language),
      formatDate: (iso, preset) => formatDate(iso, preset, language),
      formatRelative: (iso) => formatRelative(iso, language),
      parseNumber: (texto) => parseLocalizedNumber(texto, language),
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={valor}>{children}</I18nContext.Provider>;
}

/** Recorre un objeto con una clave separada por puntos. */
function buscar(objeto, clave) {
  if (!objeto) return null;
  let actual = objeto;
  for (const parte of clave.split('.')) {
    if (actual === null || typeof actual !== 'object' || !(parte in actual)) return null;
    actual = actual[parte];
  }
  return typeof actual === 'string' ? actual : null;
}
