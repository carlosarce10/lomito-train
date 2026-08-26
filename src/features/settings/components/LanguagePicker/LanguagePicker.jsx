import OptionGroup from '@shared/components/OptionGroup/OptionGroup';
import { LANGUAGES, LANGUAGE_LABELS } from '@i18n/config';
import useTranslation from '@i18n/useTranslation';

/**
 * Selector de idioma con los idiomas soportados visibles a la vez.
 *
 * Cada etiqueta es el nombre del idioma en su propio idioma, y por eso no pasa por
 * t(): quien no entiende el idioma activo tiene que poder reconocer el suyo. Por lo
 * mismo cada opcion declara su `lang`, para que el lector de pantalla no lea
 * "English" con la fonetica del castellano.
 */
export default function LanguagePicker() {
  const { t, language, setLanguage } = useTranslation('settings');

  const options = LANGUAGES.map((codigo) => ({
    id: codigo,
    label: LANGUAGE_LABELS[codigo],
    lang: codigo,
  }));

  return (
    <OptionGroup
      legend={t('language.label')}
      options={options}
      value={language}
      onChange={setLanguage}
    />
  );
}
