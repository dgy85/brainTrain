import { UserStats, StatDimension } from '../types';

const STORAGE_KEY = 'neuroprime_user_v1';

const INITIAL_STATS: UserStats = {
  calculation: 40,
  execution: 40,
  memory: 40,
  attention: 40,
  visual: 40,
  abstraction: 40,
  gamesPlayed: 0,
  lastTrained: null,
};

export const getStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...INITIAL_STATS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load stats", e);
  }
  return INITIAL_STATS;
};

export const updateStats = (dimension: StatDimension, performanceScore: number): UserStats => {
  const current = getStats();
  
  // Weighted Average Algorithm:
  // New Score = (Current * 0.7) + (Performance * 0.3)
  // This allows progress but prevents one lucky game from maxing stats immediately.
  // Performance score input is expected to be roughly 0-100 based on game scoring.
  
  const currentVal = current[dimension];
  const newVal = Math.min(100, Math.max(0, Math.round((currentVal * 0.7) + (performanceScore * 0.3))));

  const updated: UserStats = {
    ...current,
    [dimension]: newVal,
    gamesPlayed: current.gamesPlayed + 1,
    lastTrained: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const resetStats = (): UserStats => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATS));
  return INITIAL_STATS;
};