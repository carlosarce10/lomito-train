export const EQUIPMENT_TYPES = [
  { id: 'barbell', label: 'Barra', icon: '🏋️' },
  { id: 'dumbbell', label: 'Mancuernas', icon: '💪' },
  { id: 'cable', label: 'Cable', icon: '〰️' },
  { id: 'machine', label: 'Máquina', icon: '⚙️' },
  { id: 'bodyweight', label: 'Corporal', icon: '🤸' },
  { id: 'other', label: 'Otro', icon: '📦' },
];

export const EQUIPMENT_MAP = EQUIPMENT_TYPES.reduce((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});

export const getEquipmentIcon = (id) => EQUIPMENT_MAP[id]?.icon ?? '';
export const getEquipmentLabel = (id) => EQUIPMENT_MAP[id]?.label ?? '';
