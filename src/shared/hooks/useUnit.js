import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { DEFAULT_UNIT, fromKg, isUnit, stepFor, toKg } from '@domain/catalogs';
import { settingsRepository } from '@domain/storage/repositories';

/**
 * Unidad de peso activa y las conversiones que dependen de ella.
 *
 * El almacen guarda siempre kilos: esto solo decide como se muestran y como se
 * interpreta lo que el usuario escribe. Ver docs/data-model.md.
 *
 * @returns {{ unit: 'kg'|'lb', setUnit: Function, step: number,
 *             toDisplay: (kg: number) => number, toStorage: (valor: number) => number }}
 */
export default function useUnit() {
  const { store } = settingsRepository;
  const settings = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const unit = isUnit(settings.unit) ? settings.unit : DEFAULT_UNIT;

  const setUnit = useCallback((siguiente) => {
    if (isUnit(siguiente)) settingsRepository.patch({ unit: siguiente });
  }, []);

  return useMemo(
    () => ({
      unit,
      setUnit,
      step: stepFor(unit),
      toDisplay: (kg) => fromKg(kg, unit),
      toStorage: (valor) => toKg(valor, unit),
    }),
    [unit, setUnit],
  );
}
