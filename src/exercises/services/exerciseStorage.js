const STORAGE_KEY = 'lomito-train-exercises';

export const exerciseStorage = {
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save(exercises) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    } catch {
      // localStorage full or unavailable
    }
  },
};
