import { readRaw, writeRaw } from './storageUtils';

const META_KEY = 'lomito-train-meta';
const EXERCISES_KEY = 'lomito-train-exercises';
const CURRENT_VERSION = 2;

function getMeta() {
  return readRaw(META_KEY, { schemaVersion: 1 });
}

// v1 → v2: backfill `categories` array from `muscleGroup` string
function migrateV1ToV2() {
  const exercises = readRaw(EXERCISES_KEY, []);
  const migrated = exercises.map((ex) => ({
    ...ex,
    categories: ex.categories ?? (ex.muscleGroup ? [ex.muscleGroup] : []),
  }));
  writeRaw(EXERCISES_KEY, migrated);
}

export function runMigrations() {
  const meta = getMeta();
  let { schemaVersion } = meta;

  if (schemaVersion < 2) {
    migrateV1ToV2();
    schemaVersion = 2;
  }

  writeRaw(META_KEY, { ...meta, schemaVersion: CURRENT_VERSION });
}
