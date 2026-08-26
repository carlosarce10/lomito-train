import { MUSCLE_GROUPS } from '@/muscle-groups/constants/muscleGroups';
import './MuscleGroupFilter.scss';

export default function MuscleGroupFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="muscle-group-filter">
      <button
        className={`muscle-group-filter__chip ${!activeFilter ? 'muscle-group-filter__chip--active' : ''}`}
        onClick={() => onFilterChange(null)}
      >
        Todos
      </button>
      {MUSCLE_GROUPS.map((group) => (
        <button
          key={group.id}
          className={`muscle-group-filter__chip ${activeFilter === group.id ? 'muscle-group-filter__chip--active' : ''}`}
          style={
            activeFilter === group.id ? { backgroundColor: group.color, color: '#1A1A1A' } : {}
          }
          onClick={() => onFilterChange(group.id)}
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}
