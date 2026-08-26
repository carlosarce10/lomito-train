import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { settingsRepository } from '@domain/storage/repositories';

import { applyTheme, resolveTheme } from './applyTheme';
import { isTheme } from './themes';

/**
 * Tema activo y como cambiarlo. Persiste la eleccion en los ajustes.
 *
 * @returns {{ theme: 'light'|'dark'|'system', effective: 'light'|'dark',
 *             setTheme: (t: string) => void, cycleTheme: () => void }}
 */
export default function useTheme() {
  const { store } = settingsRepository;
  const settings = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const theme = settings.theme;

  const [effective, setEffective] = useState(() => resolveTheme(theme));

  useEffect(() => {
    setEffective(applyTheme(theme));
  }, [theme]);

  // En modo `system`, seguir al sistema cuando cambia sin recargar la pagina.
  useEffect(() => {
    if (theme !== 'system') return undefined;
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = () => setEffective(applyTheme('system'));
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, [theme]);

  const setTheme = useCallback((siguiente) => {
    if (isTheme(siguiente)) settingsRepository.patch({ theme: siguiente });
  }, []);

  /** Rota entre los tres estados. Es lo que usa el boton compacto de la cabecera. */
  const cycleTheme = useCallback(() => {
    const orden = ['system', 'light', 'dark'];
    const actual = settingsRepository.get().theme;
    const siguiente = orden[(orden.indexOf(actual) + 1) % orden.length];
    settingsRepository.patch({ theme: siguiente });
  }, []);

  return { theme, effective, setTheme, cycleTheme };
}
