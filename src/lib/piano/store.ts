import { create } from "zustand";

export type PracticeMode = "acoustic" | "screen";

type Saved = {
  mode: PracticeMode | null;
  completed: string[];
  stars: Record<string, number>;
  micReady: boolean;
  lastStepId: string | null;
  unlockAll: boolean;
  points: number;
  streak: number;
  lastDay: string | null;
};

const KEY = "next-note-v1";

const empty: Saved = {
  mode: null,
  completed: [],
  stars: {},
  micReady: false,
  lastStepId: null,
  unlockAll: false,
  points: 0,
  streak: 0,
  lastDay: null,
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
      points: typeof parsed.points === "number" && parsed.points > 0 ? Math.floor(parsed.points) : 0,
      streak: typeof parsed.streak === "number" && parsed.streak > 0 ? Math.floor(parsed.streak) : 0,
      lastDay: typeof parsed.lastDay === "string" ? parsed.lastDay : null,
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
  addPoints: (amount: number) => string | null;
  clearSteps: (ids: string[]) => void;
  resetProgress: () => void;
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
    points: state.points,
    streak: state.streak,
    lastDay: state.lastDay,
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
  addPoints: (amount) => {
    const gained = Math.max(0, Math.floor(amount));
    if (gained === 0) return null;
    const before = rankAt(get().points);
    const today = localDay();
    let streak = get().streak;
    if (get().lastDay !== today) streak = get().lastDay === previousDay() ? streak + 1 : 1;
    const points = get().points + gained;
    set({ points, streak, lastDay: today });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
    const after = rankAt(points);
    return after.name !== before.name ? after.name : null;
  },
  clearSteps: (ids) => {
    const drop = new Set(ids);
    const stars = { ...get().stars };
    for (const id of ids) delete stars[id];
    const last = get().lastStepId;
    set({
      completed: get().completed.filter((id) => !drop.has(id)),
      stars,
      lastStepId: last && drop.has(last) ? null : last,
    });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  resetProgress: () => {
    set({
      completed: [],
      stars: {},
      lastStepId: null,
      points: 0,
      streak: 0,
      lastDay: null,
    });
    localStorage.setItem(KEY, JSON.stringify(snapshot(get())));
  },
  reset: () => {
    set({ ...empty });
    localStorage.setItem(KEY, JSON.stringify(empty));
  },
}));

export const RANKS = [
  { points: 0, name: "First note" },
  { points: 40, name: "Key finder" },
  { points: 100, name: "Five fingers" },
  { points: 180, name: "Song starter" },
  { points: 300, name: "Melody maker" },
  { points: 480, name: "Piano pal" },
  { points: 700, name: "Concert kid" },
] as const;

export function rankAt(points: number): { name: string; next: string | null; left: number; progress: number } {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].points) index = i;
  }
  const current = RANKS[index];
  const next = RANKS[index + 1] ?? null;
  if (!next) return { name: current.name, next: null, left: 0, progress: 1 };
  const span = next.points - current.points;
  return {
    name: current.name,
    next: next.name,
    left: next.points - points,
    progress: Math.min(1, Math.max(0, (points - current.points) / span)),
  };
}

function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function previousDay(): string {
  return localDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
}
