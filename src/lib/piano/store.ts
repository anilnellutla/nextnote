import { create } from "zustand";

export type PracticeMode = "acoustic" | "screen";

type Saved = {
  mode: PracticeMode | null;
  completed: string[];
  stars: Record<string, number>;
  micReady: boolean;
  lastStepId: string | null;
  unlockAll: boolean;
};

const KEY = "next-note-v1";

const empty: Saved = {
  mode: null,
  completed: [],
  stars: {},
  micReady: false,
  lastStepId: null,
  unlockAll: false,
};

function read(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return {
      mode: parsed.mode === "acoustic" || parsed.mode === "screen" ? parsed.mode : null,
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id) => typeof id === "string") : [],
      stars: parsed.stars && typeof parsed.stars === "object" ? parsed.stars : {},
      micReady: Boolean(parsed.micReady),
      lastStepId: typeof parsed.lastStepId === "string" ? parsed.lastStepId : null,
      unlockAll: Boolean(parsed.unlockAll),
    };
  } catch {
    return { ...empty };
  }
}

type Store = Saved & {
  hydrate: () => void;
  setMode: (mode: PracticeMode) => void;
  setMicReady: () => void;
  setUnlockAll: (unlockAll: boolean) => void;
  rememberStep: (id: string) => void;
  mark: (id: string, stars: number) => void;
  reset: () => void;
};

function snapshot(state: Store): Saved {
  return {
    mode: state.mode,
    completed: state.completed,
    stars: state.stars,
    micReady: state.micReady,
    lastStepId: state.lastStepId,
    unlockAll: state.unlockAll,
  };
}

export const useStudio = create<Store>((set, get) => ({
  ...empty,
  hydrate: () => set(read()),
  setMode: (mode) => {
    set({ mode });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  setMicReady: () => {
    set({ micReady: true });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  setUnlockAll: (unlockAll) => {
    set({ unlockAll });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  rememberStep: (lastStepId) => {
    set({ lastStepId });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  mark: (id, stars) => {
    const completed = get().completed.includes(id) ? get().completed : [...get().completed, id];
    const prev = get().stars[id] ?? 0;
    const starsNext = stars > 0 ? { ...get().stars, [id]: Math.max(prev, stars) } : get().stars;
    set({ completed, stars: starsNext });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  reset: () => {
    set({ ...empty });
    localStorage.setItem(KEY, JSON.stringify(empty));
  },
}));
