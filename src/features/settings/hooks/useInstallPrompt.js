import { useCallback, useSyncExternalStore } from 'react';

import {
  getInstallState,
  isIos,
  promptInstall,
  subscribeInstallPrompt,
} from '@services/pwa/installPrompt';

/**
 * Estado de instalacion de la aplicacion y la accion que lanza el dialogo nativo.
 *
 * @returns {{ state: 'installed'|'prompt'|'manual', ios: boolean,
 *             install: () => Promise<{ ok: boolean, outcome?: string, error?: Error }> }}
 */
export default function useInstallPrompt() {
  const state = useSyncExternalStore(subscribeInstallPrompt, getInstallState);
  const install = useCallback(() => promptInstall(), []);
  return { state, ios: isIos(), install };
}
