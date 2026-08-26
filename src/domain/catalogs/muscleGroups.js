/**
 * Catalogo de grupos musculares. Los ids son estables y son lo unico que se
 * persiste; la etiqueta y el color son presentacion.
 *
 * El color sigue siendo un hexadecimal hasta la fase 4, que lo sustituye por un
 * token de tema. La etiqueta sale de i18n a partir de la fase 6.
 */
export const MUSCLE_GROUPS = [
  { id: 'upperbody', label: 'Upper Body', color: '#818cf8' },
  { id: 'lowerbody', label: 'Lower Body', color: '#fb923c' },
  { id: 'push', label: 'Push', color: '#34d399' },
  { id: 'pull', label: 'Pull', color: '#38bdf8' },
  { id: 'leg', label: 'Leg', color: '#c084fc' },
];

const BY_ID = new Map(MUSCLE_GROUPS.map((group) => [group.id, group]));

/** Ids validos del catalogo, en orden de declaracion. */
export const MUSCLE_GROUP_IDS = MUSCLE_GROUPS.map((group) => group.id);

/** Indica si un id pertenece al catalogo. */
export const isMuscleGroupId = (id) => BY_ID.has(id);

/** Etiqueta legible de un grupo, o el propio id si no esta en el catalogo. */
export const getMuscleGroupLabel = (id) => BY_ID.get(id)?.label ?? id;

/** Color de un grupo, o el color por defecto si no esta en el catalogo. */
export const getMuscleGroupColor = (id) => BY_ID.get(id)?.color ?? '#94a3b8';
