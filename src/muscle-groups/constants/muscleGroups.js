export const MUSCLE_GROUPS = [
  { id: 'upperbody', label: 'Upper Body', color: '#818cf8' },
  { id: 'lowerbody', label: 'Lower Body', color: '#fb923c' },
  { id: 'push', label: 'Push', color: '#34d399' },
  { id: 'pull', label: 'Pull', color: '#38bdf8' },
  { id: 'leg', label: 'Leg', color: '#c084fc' },
];

export const MUSCLE_GROUP_MAP = MUSCLE_GROUPS.reduce((acc, group) => {
  acc[group.id] = group;
  return acc;
}, {});

export const getMuscleGroupLabel = (id) => MUSCLE_GROUP_MAP[id]?.label || id;
export const getMuscleGroupColor = (id) => MUSCLE_GROUP_MAP[id]?.color || '#FFD600';
