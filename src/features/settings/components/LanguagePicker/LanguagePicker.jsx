import { LANGUAGES, LANGUAGE_LABELS } from '@i18n/config';
import useTranslation from '@i18n/useTranslation';

import './LanguagePicker.scss';

/**
 * Selector de idioma con los idiomas soportados visibles a la vez.
 *
 * Cada etiqueta es el nombre del idioma en su propio idioma, y por eso no pasa por
 * t(): quien no entiende el idioma activo tiene que poder reconocer el suyo.
 */
export default function LanguagePicker() {
  const { t, language, setLanguage } = useTranslation('settings');

  return (
    <fieldset className="c-language-picker">
      <legend className="c-language-picker__legend">{t('language.label')}</legend>
      <div className="c-language-picker__options">
        {LANGUAGES.map((codigo) => (
          <button
            key={codigo}
            type="button"
            className={`c-language-picker__option${language === codigo ? ' is-selected' : ''}`}
            aria-pressed={language === codigo}
            lang={codigo}
            onClick={() => setLanguage(codigo)}
          >
            {LANGUAGE_LABELS[codigo]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
