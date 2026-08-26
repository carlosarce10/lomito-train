import { mdiClose, mdiCheck, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import SearchBar from '@shared/components/SearchBar/SearchBar';

import { getMuscleGroupColor } from '@/domain/catalogs';
import { toComparableText } from '@/domain/validation/normalize';
import MuscleGroupFilter from '@/muscle-groups/components/MuscleGroupFilter/MuscleGroupFilter';
import './ExercisePicker.scss';

export default function ExercisePicker({ allExercises, selectedIds, onToggle, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  const termino = toComparableText(searchTerm);
  const filtered = allExercises.filter((ex) => {
    if (activeFilter && !ex.categories.includes(activeFilter)) return false;
    if (termino && !toComparableText(ex.name).includes(termino)) return false;
    return true;
  });

  return (
    <div className="exercise-picker">
      <div className="exercise-picker__header">
        <h2 className="exercise-picker__title">Agregar ejercicio</h2>
        <button className="exercise-picker__close" onClick={onClose} aria-label="Cerrar">
          <Icon path={mdiClose} size={0.85} />
        </button>
      </div>

      <div className="exercise-picker__search">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar ejercicio…" />
      </div>

      <div className="exercise-picker__filter">
        <MuscleGroupFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      <div className="exercise-picker__list">
        {filtered.length === 0 ? (
          <p className="exercise-picker__empty">Sin resultados</p>
        ) : (
          filtered.map((ex) => {
            const isSelected = selectedIds.includes(ex.id);
            const color = getMuscleGroupColor(ex.muscleGroup);
            return (
              <button
                key={ex.id}
                className={`exercise-picker__item${isSelected ? ' exercise-picker__item--selected' : ''}`}
                onClick={() => onToggle(ex.id)}
              >
                <span className="exercise-picker__item-dot" style={{ background: color }} />
                <span className="exercise-picker__item-name">{ex.name}</span>
                <span className="exercise-picker__item-check">
                  <Icon path={isSelected ? mdiCheck : mdiPlus} size={0.75} />
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
