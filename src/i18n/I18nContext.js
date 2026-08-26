import { createContext } from 'react';

/**
 * Contexto del idioma activo. Vive en su propio archivo porque exportar algo que no
 * es un componente junto a uno rompe el refresco rapido de Vite.
 */
export const I18nContext = createContext(null);
