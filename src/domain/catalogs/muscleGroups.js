/**
 * Catalogo de grupos musculares.
 *
 * Guarda solo el id y el color. La etiqueta vive en i18n (`catalog.muscleGroups.*`):
 * un catalogo describe datos, y una etiqueta legible es presentacion.
 */
export const MUSCLE_GROUPS = [
  { id: 'upperbody', color: '#818cf8' },
  { id: 'lowerbody', color: '#fb923c' },
  { id: 'push', color: '#34d399' },
  { id: 'pull', color: '#38bdf8' },
  { id: 'leg', color: '#c084fc' },
];

const BY_ID = new Map(MUSCLE_GROUPS.map((group) => [group.id, group]));

/** Ids validos del catalogo, en orden de declaracion. */
export const MUSCLE_GROUP_IDS = MUSCLE_GROUPS.map((group) => group.id);

/** Indica si un id pertenece al catalogo. */
export const isMuscleGroupId = (id) => BY_ID.has(id);

/** Color de un grupo, o el color de respaldo si no esta en el catalogo. */
export const getMuscleGroupColor = (id) => BY_ID.get(id)?.color ?? '#94a3b8';
