/**
 * Catalogo de equipamiento. El id es lo unico que se persiste.
 *
 * El campo `icon` nombra un icono de Material Design Icons y lo resuelve la capa
 * de presentacion. No hay emojis: el catalogo describe datos, no apariencia.
 */
export const EQUIPMENT_TYPES = [
  { id: 'barbell', label: 'Barra', icon: 'weight-lifter' },
  { id: 'dumbbell', label: 'Mancuernas', icon: 'dumbbell' },
  { id: 'cable', label: 'Cable', icon: 'cog' },
  { id: 'machine', label: 'Maquina', icon: 'cog' },
  { id: 'bodyweight', label: 'Corporal', icon: 'run' },
  { id: 'other', label: 'Otro', icon: 'help-circle' },
];

const BY_ID = new Map(EQUIPMENT_TYPES.map((item) => [item.id, item]));

/** Ids validos del catalogo, en orden de declaracion. */
export const EQUIPMENT_IDS = EQUIPMENT_TYPES.map((item) => item.id);

/** Indica si un id pertenece al catalogo. */
export const isEquipmentId = (id) => BY_ID.has(id);

/** Etiqueta legible del equipamiento, o cadena vacia si no esta en el catalogo. */
export const getEquipmentLabel = (id) => BY_ID.get(id)?.label ?? '';

/** Nombre del icono MDI del equipamiento, o cadena vacia si no esta. */
export const getEquipmentIcon = (id) => BY_ID.get(id)?.icon ?? '';
