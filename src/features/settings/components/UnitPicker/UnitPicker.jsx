import { UNITS } from '@domain/catalogs';
import OptionGroup from '@shared/components/OptionGroup/OptionGroup';
import useUnit from '@shared/hooks/useUnit';
import useTranslation from '@i18n/useTranslation';

/**
 * Selector de la unidad en la que se muestran los pesos.
 *
 * Las opciones salen de UNITS y no de una lista propia, porque el dominio es quien
 * sabe que unidades sabe convertir. La pista aclara que el almacen sigue en kilos:
 * sin ella, cambiar de unidad parece que reescribe los datos.
 */
export default function UnitPicker() {
  const { unit, setUnit } = useUnit();
  const { t } = useTranslation('settings');

  const options = UNITS.map((id) => ({ id, label: t(`unit.${id}`) }));

  return (
    <OptionGroup
      legend={t('unit.label')}
      hint={t('unit.hint')}
      options={options}
      value={unit}
      onChange={setUnit}
    />
  );
}
