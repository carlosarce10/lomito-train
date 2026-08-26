import { useMemo, useState } from 'react';

import { toComparableText } from '@domain/validation/normalize';

/**
 * Estado de interfaz para filtrar y buscar ejercicios. No toca el almacenamiento.
 *
 * La busqueda ignora acentos y mayusculas, asi que "bíceps" encuentra "biceps".
 *
 * @param {Array} exercises Coleccion completa.
 * @returns {{ filtered: Array, activeFilter: string|null, setActiveFilter: Function,
 *            searchTerm: string, setSearchTerm: Function }}
 */
export default function useExerciseFilters(exercises) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const termino = toComparableText(searchTerm);

    return exercises.filter((ex) => {
      if (activeFilter && !ex.muscleGroupIds.includes(activeFilter)) return false;
      if (termino && !toComparableText(ex.name).includes(termino)) return false;
      return true;
    });
  }, [exercises, activeFilter, searchTerm]);

  return { filtered, activeFilter, setActiveFilter, searchTerm, setSearchTerm };
}
