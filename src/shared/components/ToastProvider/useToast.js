import { useContext } from 'react';

import { ToastContext } from './ToastContext';

/**
 * Acceso a los avisos no bloqueantes.
 *
 * @returns {{ error: (m: string) => void, success: (m: string) => void,
 *             descartar: (id: number) => void }}
 */
export default function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast necesita estar dentro de ToastProvider.');
  return contexto;
}
