const LETTERS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const RANGE_START = 48;
export const RANGE_END = 79;

export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function isBlack(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(pitchClass(midi));
}

export function letterOf(midi: number): string {
  return LETTERS[pitchClass(midi)];
}

const SHARP_NAMES: Record<number, string> = {
  1: "C sharp",
  3: "D sharp",
  6: "F sharp",
  8: "G sharp",
  10: "A sharp",
};

/** What the lesson calls the note out loud. Never "C4". */
export function kidName(midi: number): string {
  const pc = pitchClass(midi);
  const oct = octaveOf(midi);
  const sharp = SHARP_NAMES[pc];
  if (sharp) {
    if (oct <= 3) return `low ${sharp}`;
    if (oct >= 5) return `high ${sharp}`;
    return sharp;
  }
  const letter = LETTERS[pc];
  if (midi === 60) return "middle C";
  if (oct <= 3) return `low ${letter}`;
  if (oct >= 5) return `high ${letter}`;
  return letter;
}

export function howToFind(midi: number): string {
  const guides: Record<number, string> = {
    0: "Find two black keys. The white key just to their left is C.",
    2: "Find two black keys. The white key between them is D.",
    4: "Find two black keys. The white key just to their right is E.",
    5: "Find three black keys. The white key just to their left is F.",
    7: "Find three black keys. The first white key tucked inside them is G.",
    9: "Find three black keys. The middle white key is A.",
    11: "Find three black keys. The white key just to their right is B.",
  };
  return guides[pitchClass(midi)] ?? "Slide off the black key onto a white key.";
}

export function coach(played: number, expected: number): string {
  if (played === expected) return "";
  const heard = kidName(played);
  const want = kidName(expected);
  if (pitchClass(played) === pitchClass(expected)) {
    if (played < expected) {
      return `I heard ${heard}. Right name, but too far toward the low end. Move up the piano and find ${want}.`;
    }
    return `I heard ${heard}. That's the higher one. Move down the piano and find ${want}.`;
  }
  if (isBlack(played) && !isBlack(expected)) {
    return `I heard ${heard}, a black key. ${want} is a white key. ${howToFind(expected)}`;
  }
  const diff = played - expected;
  if (diff > 0 && diff <= 2) {
    return `I heard ${heard}. A little too high — one white key to the left.`;
  }
  if (diff < 0 && diff >= -2) {
    return `I heard ${heard}. A little too low — one white key to the right.`;
  }
  return `I heard ${heard}. We want ${want}. ${howToFind(expected)}`;
}

export function coachAccept(played: number, accept: number[]): string | null {
  if (accept.includes(played)) return null;
  const same = accept.find((midi) => pitchClass(midi) === pitchClass(played));
  if (same != null) return coach(played, same);
  let best = accept[0];
  let bestDist = Math.abs(played - best);
  for (const midi of accept) {
    const dist = Math.abs(played - midi);
    if (dist < bestDist) {
      best = midi;
      bestDist = dist;
    }
  }
  return coach(played, best);
}

export function diatonic(midi: number): number {
  const letter = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pitchClass(midi)];
  return octaveOf(midi) * 7 + letter;
}

/** Steps above the bottom line. Treble bottom is E4, bass bottom is G2. */
export function staffSteps(midi: number, clef: "treble" | "bass"): number {
  if (clef === "treble") return diatonic(midi) - diatonic(64);
  return diatonic(midi) - diatonic(43);
}

export function allOfClass(pc: number, low = 36, high = 96): number[] {
  const notes: number[] = [];
  for (let midi = low; midi <= high; midi++) {
    if (pitchClass(midi) === pc) notes.push(midi);
  }
  return notes;
}

export function rangeMidis(): number[] {
  const notes: number[] = [];
  for (let midi = RANGE_START; midi <= RANGE_END; midi++) notes.push(midi);
  return notes;
}
