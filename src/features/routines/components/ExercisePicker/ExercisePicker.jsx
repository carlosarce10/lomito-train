import { mdiClose, mdiCheck, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';

import { getMuscleGroupColor } from '@domain/catalogs';
import { toComparableText } from '@domain/validation/normalize';
import SearchBar from '@shared/components/SearchBar/SearchBar';
import { MuscleGroupFilter } from '@features/exercises';

import './ExercisePicker.scss';

export default function ExercisePicker({ allExercises, selectedIds, onToggle, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  const termino = toComparableText(searchTerm);
  const filtered = allExercises.filter((ex) => {
    if (activeFilter && !ex.muscleGroupIds.includes(activeFilter)) return false;
    if (termino && !toComparableText(ex.name).includes(termino)) return false;
    return true;
  });

  return (
    <div className="c-exercise-picker">
      <div className="c-exercise-picker__header">
        <h2 className="c-exercise-picker__title">Agregar ejercicio</h2>
        <button className="c-exercise-picker__close" onClick={onClose} aria-label="Cerrar">
          <Icon path={mdiClose} size={0.85} />
        </button>
      </div>

      <div>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar ejercicio…" />
      </div>

      <div>
        <MuscleGroupFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      <div className="c-exercise-picker__list">
        {filtered.length === 0 ? (
          <p className="c-exercise-picker__empty">Sin resultados</p>
        ) : (
          filtered.map((ex) => {
            const isSelected = selectedIds.includes(ex.id);
            const color = getMuscleGroupColor(ex.muscleGroupIds[0]);
            return (
              <button
                key={ex.id}
                className={`c-exercise-picker__item${isSelected ? ' exercise-picker__item--selected' : ''}`}
                onClick={() => onToggle(ex.id)}
              >
                <span
                  className="c-exercise-picker__item-dot"
                  style={{ '--exercise-color': color }}
                />
                <span className="c-exercise-picker__item-name">{ex.name}</span>
                <span className="c-exercise-picker__item-check">
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
