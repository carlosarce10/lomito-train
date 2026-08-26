import { MUSCLE_GROUPS } from '@domain/catalogs';

import './MuscleGroupFilter.scss';

/**
 * Fila de chips para filtrar ejercicios por grupo muscular.
 *
 * El color de cada grupo se inyecta como custom property y el SCSS decide como se
 * usa. Antes el JSX pintaba el chip activo con un style en linea, que ganaba a
 * cualquier regla de tema y dejaba ese chip fuera del sistema.
 *
 * @param {object} props
 * @param {string|null} props.activeFilter Id activo, o null para todos.
 * @param {(id: string|null) => void} props.onFilterChange
 */
export default function MuscleGroupFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="c-muscle-group-filter o-scroll-x">
      <button
        type="button"
        className={`c-muscle-group-filter__chip${!activeFilter ? ' is-active' : ''}`}
        aria-pressed={!activeFilter}
        onClick={() => onFilterChange(null)}
      >
        Todos
      </button>
      {MUSCLE_GROUPS.map((group) => (
        <button
          key={group.id}
          type="button"
          className={`c-muscle-group-filter__chip${activeFilter === group.id ? ' is-active' : ''}`}
          style={{ '--group-color': group.color }}
          aria-pressed={activeFilter === group.id}
          onClick={() => onFilterChange(group.id)}
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}
