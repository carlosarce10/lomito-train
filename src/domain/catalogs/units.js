/**
 * Unidades de peso.
 *
 * El almacenamiento es SIEMPRE en kilos, pase lo que pase con esta preferencia.
 * La unidad es una decision de presentacion, no un dato del ejercicio, y por eso no
 * se guarda junto a cada serie.
 *
 * El motivo es concreto: si cada serie guardara su unidad, cambiar la preferencia
 * dejaria un historico mezclado, y calcular una marca personal obligaria a convertir
 * igualmente. Guardando kilos, la conversion ocurre en un unico sitio y el dato
 * nunca se reescribe al cambiar de unidad, que es cuando se pierden cosas.
 */
export const UNITS = ['kg', 'lb'];

/** Unidad por defecto. */
export const DEFAULT_UNIT = 'kg';

/** Indica si un valor es una unidad soportada. */
export const isUnit = (value) => UNITS.includes(value);

const LB_POR_KG = 2.2046226218;

/**
 * Convierte de kilos a la unidad indicada, para mostrar.
 *
 * @param {number} kg Peso guardado.
 * @param {'kg'|'lb'} unit Unidad de destino.
 * @returns {number} Valor en la unidad pedida, redondeado a un decimal.
 */
export function fromKg(kg, unit) {
  if (!Number.isFinite(kg)) return 0;
  if (unit !== 'lb') return kg;
  return Math.round(kg * LB_POR_KG * 10) / 10;
}

/**
 * Convierte a kilos desde la unidad indicada, para guardar.
 *
 * Redondea a dos decimales, que es lo que hace estable el viaje de ida y vuelta:
 * 185 lb pasan a 83,91 kg y vuelven a 185,0 lb. Sin ese redondeo el valor iria
 * derivando cada vez que el usuario cambia de unidad.
 *
 * @param {number} valor Peso en la unidad de origen.
 * @param {'kg'|'lb'} unit Unidad de origen.
 * @returns {number} Peso en kilos.
 */
export function toKg(valor, unit) {
  if (!Number.isFinite(valor)) return 0;
  const kg = unit === 'lb' ? valor / LB_POR_KG : valor;
  return Math.round(kg * 100) / 100;
}

/**
 * Incremento natural de la unidad: el disco mas pequeno que se usa en un gimnasio.
 *
 * @param {'kg'|'lb'} unit
 * @returns {number}
 */
export const stepFor = (unit) => (unit === 'lb' ? 0.5 : 0.25);
