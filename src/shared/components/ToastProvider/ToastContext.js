import { createContext } from 'react';

/**
 * Contexto de los avisos. En su propio archivo porque exportar algo que no es un
 * componente junto a uno rompe el refresco rapido de Vite.
 */
export const ToastContext = createContext(null);
