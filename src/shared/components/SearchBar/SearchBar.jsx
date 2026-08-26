import { mdiMagnify, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import './SearchBar.scss';

export default function SearchBar({ value, onChange, placeholder = 'Buscar…' }) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon">
        <Icon path={mdiMagnify} size={0.85} />
      </span>
      <input
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          type="button"
        >
          <Icon path={mdiClose} size={0.75} />
        </button>
      )}
    </div>
  );
}
