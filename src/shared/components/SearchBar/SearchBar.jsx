import { mdiMagnify, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';

import useTranslation from '@i18n/useTranslation';

import './SearchBar.scss';

/**
 * Campo de busqueda con icono y boton de limpiado.
 *
 * @param {object} props
 * @param {string} props.value Texto actual del filtro.
 * @param {(valor: string) => void} props.onChange Notifica cada cambio del texto.
 * @param {string} [props.placeholder] Texto de ayuda; si falta se usa el generico.
 */
export default function SearchBar({ value, onChange, placeholder }) {
  const { t } = useTranslation('common');

  return (
    <div className="c-search-bar">
      <span className="c-search-bar__icon">
        <Icon path={mdiMagnify} size={0.85} />
      </span>
      <input
        className="c-search-bar__input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('search.placeholder')}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {value && (
        <button
          className="c-search-bar__clear"
          onClick={() => onChange('')}
          aria-label={t('search.clear')}
          type="button"
        >
          <Icon path={mdiClose} size={0.75} />
        </button>
      )}
    </div>
  );
}
