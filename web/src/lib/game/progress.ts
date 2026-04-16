const STORAGE_KEY = "power-grid-sim-progress";

export interface ProgressState {
  maxUnlockedIndex: number;
  currentIndex: number;
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") {
    return { maxUnlockedIndex: 0, currentIndex: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { maxUnlockedIndex: 0, currentIndex: 0 };
    }
    const p = JSON.parse(raw) as ProgressState;
    return {
      maxUnlockedIndex: Math.max(0, Number(p.maxUnlockedIndex) || 0),
      currentIndex: Math.max(0, Number(p.currentIndex) || 0),
    };
  } catch {
    return { maxUnlockedIndex: 0, currentIndex: 0 };
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function onLevelComplete(
  completedIndex: number,
  levelCount: number,
): ProgressState {
  const next = Math.min(completedIndex + 1, levelCount - 1);
  const maxUnlockedIndex = Math.min(
    levelCount - 1,
    Math.max(completedIndex + 1, loadProgress().maxUnlockedIndex),
  );
  const state: ProgressState = {
    maxUnlockedIndex,
    currentIndex: next,
  };
  saveProgress(state);
  return state;
}
