/**
 * Catalogo de equipamiento.
 *
 * Guarda solo el id y el nombre de un icono de Material Design Icons, que resuelve
 * la capa de presentacion. La etiqueta vive en i18n (`catalog.equipment.*`).
 * Antes este catalogo llevaba etiquetas en espanol y ademas emojis.
 */
export const EQUIPMENT_TYPES = [
  { id: 'barbell', icon: 'weight-lifter' },
  { id: 'dumbbell', icon: 'dumbbell' },
  // Ni el cable ni la maquina llevan engrane: en esta aplicacion el engrane es el
  // icono de la pestana Ajustes, y el usuario leia "configurar" donde decia
  // "maquina". El gancho es el enganche de la polea; la pesa, la torre de discos.
  { id: 'cable', icon: 'hook' },
  { id: 'machine', icon: 'weight' },
  { id: 'bodyweight', icon: 'run' },
  { id: 'other', icon: 'help-circle' },
];

const BY_ID = new Map(EQUIPMENT_TYPES.map((item) => [item.id, item]));

/** Ids validos del catalogo, en orden de declaracion. */
export const EQUIPMENT_IDS = EQUIPMENT_TYPES.map((item) => item.id);

/** Indica si un id pertenece al catalogo. */
export const isEquipmentId = (id) => BY_ID.has(id);

/** Nombre del icono MDI del equipamiento, o cadena vacia si no esta. */
export const getEquipmentIcon = (id) => BY_ID.get(id)?.icon ?? '';
