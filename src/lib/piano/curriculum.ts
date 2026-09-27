import { allOfClass } from "./theory";

export type Guide = "two" | "three" | "both";
export type Clef = "treble" | "bass";

type StepBase = {
  id: string;
  say: string;
  sayScreen?: string;
  hint: string;
  success: string;
  position?: number[];
  fingers?: Record<number, string>;
  guide?: Guide;
  clef?: Clef;
};

export type Step =
  | (StepBase & { kind: "talk" })
  | (StepBase & { kind: "explore" })
  | (StepBase & { kind: "find"; accept: number[] })
  | (StepBase & { kind: "phrase"; notes: number[]; lyrics?: string[] });

export type Unit = {
  id: string;
  title: string;
  blurb: string;
  steps: Step[];
};

const RH_POS = [60, 62, 64, 65, 67];
const RH: Record<number, string> = { 60: "1", 62: "2", 64: "3", 65: "4", 67: "5" };
const LH_POS = [48, 50, 52, 53, 55];
const LH: Record<number, string> = { 48: "5", 50: "4", 52: "3", 53: "2", 55: "1" };
const BOTH: Record<number, string> = { ...LH, ...RH };

const ANY_C = allOfClass(0);

const hot = [64, 62, 60];
const hotWords = ["Hot", "cross", "buns"];
const pennyC = [60, 60, 60, 60];
const pennyCWords = ["One", "a", "pen-", "ny"];
const pennyD = [62, 62, 62, 62];
const pennyDWords = ["Two", "a", "pen-", "ny"];

const maryA = [64, 62, 60, 62, 64, 64, 64];
const maryAWords = ["Ma-", "ry", "had", "a", "lit-", "tle", "lamb"];
const maryB = [62, 62, 62, 64, 67, 67];
const maryBWords = ["Lit-", "tle", "lamb,", "lit-", "tle", "lamb"];
const maryC = [64, 62, 62, 64, 62, 60];
const maryCWords = ["Whose", "fleece", "was", "white", "as", "snow"];

const yankeeA = [60, 60, 62, 64, 60, 64, 62];
const yankeeAWords = ["Yan-", "kee", "Doo-", "dle", "went", "to", "town"];
const yankeeB = [60, 60, 62, 64, 60, 59, 60];
const yankeeBWords = ["A-", "rid-", "ing", "on", "a", "po-", "ny"];
const yankeeC = [60, 60, 62, 64, 65, 64, 62];
const yankeeCWords = ["Stuck", "a", "fea-", "ther", "in", "his", "cap"];
const yankeeD = [60, 60, 62, 64, 60, 59, 60];
const yankeeDWords = ["And", "called", "it", "ma-", "ca-", "ro-", "ni"];
const RH_B: Record<number, string> = { ...RH, 59: "1" };

export const UNITS: Unit[] = [
  {
    id: "map",
    title: "The piano map",
    blurb: "Black keys, white keys, and middle C.",
    steps: [
      {
        id: "map-sit",
        kind: "talk",
        say: "Sit in the middle of the bench, tummy facing the middle of the keys. Feet on the floor if they reach. This device stays on the music stand so I can hear the piano. Hands in your lap for a second.",
        sayScreen: "Sit where you can see the keys on the screen. When you move to the real piano, switch to “Our piano” and I’ll listen from the music stand. Hands soft, like you’re holding a bubble.",
        hint: "",
        success: "",
      },
      {
        id: "map-groups",
        kind: "talk",
        guide: "both",
        say: "Look at the black keys. They never come in fours. Only twos, and threes. That pattern repeats all the way up the piano. You never have to count from the end.",
        hint: "Two black keys, then three black keys, over and over.",
        success: "",
      },
      {
        id: "map-explore",
        kind: "explore",
        say: "Play any one key, then let it go. I’ll tell you its name. Try a white key, then a black one. One at a time — I hear one note, like a teacher sitting beside you.",
        sayScreen: "Tap any one key. I’ll tell you its name. Try a white key, then a black one.",
        hint: "Play just one key and wait. If I stay quiet, play a little louder.",
        success: "",
      },
      {
        id: "map-any-c",
        kind: "find",
        guide: "two",
        accept: ANY_C,
        say: "Find a group of two black keys. The white key tucked just to their left is called C. Any C on the piano counts. Play it.",
        hint: "Ignore the three-black-key groups for now. Two black keys. White key on their left.",
        success: "Yes. That’s C. Every group of two black keys has its own C.",
      },
      {
        id: "map-middle-c",
        kind: "find",
        guide: "two",
        clef: "treble",
        accept: [60],
        say: "Now the C in the middle of the piano — the one closest to the lock, or to your belly button. That’s middle C. It’s the front door of almost every first song.",
        hint: "If you already found a C and I said it was too low or too high, walk to the next group of two black keys, toward the middle.",
        success: "Middle C. Thumb of your right hand is going to live here.",
      },
      {
        id: "map-done",
        kind: "talk",
        say: "You can find C without counting from the end of the piano. That’s the map. Everything else hangs off it.",
        hint: "",
        success: "",
      },
    ],
  },
  {
    id: "right",
    title: "Right hand",
    blurb: "Finger numbers, then five notes that climb home.",
    steps: [
      {
        id: "rh-numbers",
        kind: "talk",
        say: "Right hand. Thumb is finger 1. Pointer is 2. Middle is 3. Ring is 4. Pinky is 5. Wiggle them once so the numbers stick.",
        hint: "",
        success: "",
      },
      {
        id: "rh-place",
        kind: "talk",
        position: RH_POS,
        fingers: RH,
        say: "Curve your fingers. Set thumb on middle C, then 2 on D, 3 on E, 4 on F, 5 on G. The glowing keys are that hand shape. Hover — don’t press yet.",
        sayScreen: "The glowing keys are your right-hand shape. Thumb on middle C, then D, E, F, and G. Don’t tap yet.",
        hint: "Thumb is 1, on middle C. Pinky is 5, on G.",
        success: "",
      },
      {
        id: "rh-c",
        kind: "find",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        accept: [60],
        say: "Play middle C with finger 1. Just the thumb. The other fingers stay quiet.",
        hint: "Thumb, on the white key just left of two black keys, in the middle of the piano.",
        success: "Thumb on middle C. That’s home.",
      },
      {
        id: "rh-d",
        kind: "find",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        accept: [62],
        say: "Finger 2, the pointer, plays D. It’s the next white key up — between the two black keys.",
        hint: "Don’t move your whole hand. Just the pointer finger.",
        success: "D with finger 2.",
      },
      {
        id: "rh-e",
        kind: "find",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        accept: [64],
        say: "Finger 3 plays E. White key just to the right of the two black keys.",
        hint: "Middle finger. If you played D, go one white key higher.",
        success: "E. Your middle finger.",
      },
      {
        id: "rh-f",
        kind: "find",
        position: RH_POS,
        fingers: RH,
        guide: "three",
        clef: "treble",
        accept: [65],
        say: "Finger 4 plays F. F sits just left of the three black keys. It feels close to E — they’re neighbors, with no black key between them.",
        hint: "E then one white key to the right. Ring finger.",
        success: "F with finger 4.",
      },
      {
        id: "rh-g",
        kind: "find",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        accept: [67],
        say: "Pinky, finger 5, plays G. First white key inside the three black keys.",
        hint: "Stretch a little. Don’t shove the whole hand.",
        success: "G. Your five fingers have a home now.",
      },
      {
        id: "rh-up-back",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [60, 62, 64, 62, 60],
        lyrics: ["C", "D", "E", "D", "C"],
        say: "Play up and back: C, D, E, D, C. Wait for each note. I’ll tell you when the next one is due. Fingers 1, 2, 3, 2, 1.",
        hint: "Stay in the hand shape. Don’t look down and shift.",
        success: "Up and back, clean. That’s a real pattern, not just one key.",
      },
      {
        id: "rh-climb",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [60, 62, 64, 65, 67],
        lyrics: ["C", "D", "E", "F", "G"],
        say: "Climb: C D E F G. One finger each, 1 through 5. Let the key come back up before the next finger.",
        hint: "If two notes sound at once, you stayed down. Let go, then play the next.",
        success: "You climbed to G.",
      },
      {
        id: "rh-home",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [67, 65, 64, 62, 60],
        lyrics: ["G", "F", "E", "D", "C"],
        say: "Come home: G F E D C. Pinky down to thumb.",
        hint: "5, 4, 3, 2, 1. End on middle C.",
        success: "Home on middle C. Right hand knows the neighborhood.",
      },
    ],
  },
  {
    id: "buns",
    title: "Hot Cross Buns",
    blurb: "Your first song. Three notes, said with the words.",
    steps: [
      {
        id: "buns-intro",
        kind: "talk",
        position: RH_POS,
        fingers: RH,
        say: "Hot Cross Buns uses only E, D, and C. Fingers 3, 2, 1. Hear it first, then you’ll play it in little pieces, the way a teacher breaks a song.",
        hint: "Tap Hear it. Watch E, then D, then C.",
        success: "",
      },
      {
        id: "buns-1",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: hot,
        lyrics: hotWords,
        say: "First line. Say the words while you play: Hot, cross, buns. Fingers 3, 2, 1.",
        hint: "E is finger 3, just right of the two black keys. Then D, then middle C.",
        success: "That’s the whole idea of the song.",
      },
      {
        id: "buns-2",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: hot,
        lyrics: hotWords,
        say: "Same line again. Hot, cross, buns. Try to keep the hand still and let the fingers walk.",
        hint: "Same three keys. Don’t start over on a different C.",
        success: "Second time is how it becomes yours.",
      },
      {
        id: "buns-penny",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: pennyC,
        lyrics: pennyCWords,
        say: "“One a pen-ny” is middle C, four times. Thumb only. Lift between notes so I hear four separate sounds.",
        hint: "Four thumb notes. Let the key rise, then play again.",
        success: "Four clear C’s.",
      },
      {
        id: "buns-two",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: pennyD,
        lyrics: pennyDWords,
        say: "“Two a pen-ny” is D, four times. Finger 2. Same lifting.",
        hint: "Pointer finger, the white key between the two black keys.",
        success: "Four D’s. The song is almost in your hand.",
      },
      {
        id: "buns-all",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [...hot, ...hot, ...pennyC, ...pennyD, ...hot],
        lyrics: [...hotWords, ...hotWords, ...pennyCWords, ...pennyDWords, ...hotWords],
        say: "The whole song, slowly. I’ll wait at every note. Words are on the screen. No rush.",
        hint: "If you get lost, start this line again. The words tell you where you are.",
        success: "Hot Cross Buns, beginning to end. That’s a piece you can play for someone tonight.",
      },
    ],
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    blurb: "A longer song, still in the same five fingers.",
    steps: [
      {
        id: "mary-intro",
        kind: "talk",
        position: RH_POS,
        fingers: RH,
        say: "Mary stays in the same right-hand shape, and once reaches up to G with the pinky. We’ll learn it line by line.",
        hint: "",
        success: "",
      },
      {
        id: "mary-1",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: maryA,
        lyrics: maryAWords,
        say: "“Mary had a little lamb.” It starts on E, dips to C, and comes back to E. Fingers 3, 2, 1, 2, 3, 3, 3.",
        hint: "Three E’s at the end — middle finger, lifted each time.",
        success: "First line.",
      },
      {
        id: "mary-2",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: maryB,
        lyrics: maryBWords,
        say: "“Little lamb, little lamb.” Three D’s with finger 2, then E, then two G’s with the pinky.",
        hint: "G is finger 5, inside the three black keys.",
        success: "The pinky got a turn.",
      },
      {
        id: "mary-3",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: maryA,
        lyrics: maryAWords,
        say: "“Mary had a little lamb” again. Same as the first line.",
        hint: "Start on E, finger 3.",
        success: "You already knew this line.",
      },
      {
        id: "mary-4",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: maryC,
        lyrics: maryCWords,
        say: "“Whose fleece was white as snow.” It ends on middle C. Last three fingers: 3, 2, 1.",
        hint: "E, D, D, E, D, C.",
        success: "That’s the ending. It lands at home.",
      },
      {
        id: "mary-all",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [...maryA, ...maryB, ...maryA, ...maryC],
        lyrics: [...maryAWords, ...maryBWords, ...maryAWords, ...maryCWords],
        say: "All of Mary, slowly. Follow the word. If a note goes wrong, stay on that word — don’t skip ahead.",
        hint: "Start this line again if the words and your fingers split apart.",
        success: "Mary Had a Little Lamb. Two songs in your right hand.",
      },
    ],
  },
  {
    id: "yankee",
    title: "Yankee Doodle",
    blurb: "The song you already sing. Same hand, one extra note.",
    steps: [
      {
        id: "yankee-intro",
        kind: "talk",
        position: RH_POS,
        fingers: RH_B,
        say: "Yankee Doodle uses the same right-hand shape. One note, B, sits just below middle C — the thumb steps down to it.",
        hint: "",
        success: "",
      },
      {
        id: "yankee-1",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: yankeeA,
        lyrics: yankeeAWords,
        say: "“Yankee Doodle went to town.” It starts with two middle C’s, thumb, then climbs to E.",
        hint: "C C D E, then C E D.",
        success: "That’s the line everyone knows.",
      },
      {
        id: "yankee-2",
        kind: "phrase",
        position: [...RH_POS, 59],
        fingers: RH_B,
        clef: "treble",
        notes: yankeeB,
        lyrics: yankeeBWords,
        say: "“A-riding on a pony.” The thumb steps down to B for “po-”, then back to middle C.",
        hint: "B is the white key just left of middle C. Same thumb.",
        success: "Thumb down, thumb home.",
      },
      {
        id: "yankee-3",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: yankeeC,
        lyrics: yankeeCWords,
        say: "“Stuck a feather in his cap.” Finger 4 plays F on “in”.",
        hint: "F is the white key just left of the three black keys.",
        success: "The feather line.",
      },
      {
        id: "yankee-4",
        kind: "phrase",
        position: [...RH_POS, 59],
        fingers: RH_B,
        clef: "treble",
        notes: yankeeD,
        lyrics: yankeeDWords,
        say: "“And called it macaroni.” Same ending as pony: thumb down to B, then home on C.",
        hint: "B on “ro-”, middle C on “ni”.",
        success: "That’s the verse.",
      },
      {
        id: "yankee-all",
        kind: "phrase",
        position: [...RH_POS, 59],
        fingers: RH_B,
        clef: "treble",
        notes: [...yankeeA, ...yankeeB, ...yankeeC, ...yankeeD],
        lyrics: [...yankeeAWords, ...yankeeBWords, ...yankeeCWords, ...yankeeDWords],
        say: "All of Yankee Doodle, slowly. Sing the word you see.",
        hint: "Start on middle C. Thumb steps down only for pony and macaroni.",
        success: "Yankee Doodle, beginning to end.",
      },
    ],
  },
  {
    id: "left",
    title: "Left hand",
    blurb: "The same idea, one octave lower. Pinky on low C.",
    steps: [
      {
        id: "lh-mirror",
        kind: "talk",
        position: LH_POS,
        fingers: LH,
        say: "Left hand is not a copy with the thumb on C. Pinky, finger 5, goes on low C — the C just below middle C. Thumb, finger 1, reaches up to low G. The glowing keys are that shape.",
        hint: "Low C is the next C down from middle C. Still just left of two black keys.",
        success: "",
      },
      {
        id: "lh-c",
        kind: "find",
        position: LH_POS,
        fingers: LH,
        clef: "bass",
        accept: [48],
        say: "Play low C with left-hand finger 5, the pinky. Right hand rests in your lap.",
        hint: "One group of two black keys below middle C. White key on the left. Pinky.",
        success: "Low C. Pinky has a home.",
      },
      {
        id: "lh-d",
        kind: "find",
        position: LH_POS,
        fingers: LH,
        clef: "bass",
        accept: [50],
        say: "Finger 4 plays the next white key, low D.",
        hint: "Ring finger. One white key higher than low C.",
        success: "Low D, finger 4.",
      },
      {
        id: "lh-e",
        kind: "find",
        position: LH_POS,
        fingers: LH,
        clef: "bass",
        accept: [52],
        say: "Finger 3 plays low E.",
        hint: "Middle finger, white key just right of the two black keys.",
        success: "Low E.",
      },
      {
        id: "lh-walk",
        kind: "phrase",
        position: LH_POS,
        fingers: LH,
        clef: "bass",
        notes: [48, 50, 52, 50, 48],
        lyrics: ["C", "D", "E", "D", "home"],
        say: "Left hand walks and comes home: low C, D, E, D, C. Fingers 5, 4, 3, 4, 5.",
        hint: "Pinky starts. Keep the right hand off the keys.",
        success: "Left hand can walk by itself.",
      },
      {
        id: "lh-climb",
        kind: "phrase",
        position: LH_POS,
        fingers: LH,
        clef: "bass",
        notes: [48, 50, 52, 53, 55],
        lyrics: ["C", "D", "E", "F", "G"],
        say: "Climb with the left hand too: C D E F G. Fingers 5, 4, 3, 2, 1. Thumb plays G.",
        hint: "Thumb is the highest of these five, not the lowest.",
        success: "Left-hand thumb on G.",
      },
    ],
  },
  {
    id: "turns",
    title: "Hands take turns",
    blurb: "One note at a time, passed from hand to hand.",
    steps: [
      {
        id: "turns-why",
        kind: "talk",
        say: "A real teacher eventually asks for both hands at once. I don’t, yet. I hear one note at a time, and two notes together would be a guess. So the hands take turns. That’s also how careful practice starts.",
        sayScreen: "These steps pass one note from the right hand to the left. On the real piano I’ll only listen to one note at a time, so we practice that way.",
        hint: "",
        success: "",
      },
      {
        id: "turns-cs",
        kind: "phrase",
        position: [...LH_POS, ...RH_POS],
        fingers: BOTH,
        notes: [60, 48, 60, 48],
        lyrics: ["Right", "left", "right", "left"],
        say: "Middle C with the right thumb, then low C with the left pinky. Back and forth. Say “right, left” so the hands don’t pile on.",
        hint: "Right thumb, middle C. Left pinky, the C below it.",
        success: "Two C’s, two hands, never at the same time.",
      },
      {
        id: "turns-walk",
        kind: "phrase",
        position: [...LH_POS, ...RH_POS],
        fingers: BOTH,
        notes: [60, 48, 62, 50, 64, 52],
        lyrics: ["C", "C", "D", "D", "E", "E"],
        say: "Right hand plays a note, left hand copies it lower. C then low C, D then low D, E then low E.",
        hint: "Right finger first: 1, then left 5. Then right 2, left 4. Then right 3, left 3.",
        success: "The left hand copied the right. That’s a practice trick you can use on any new song.",
      },
    ],
  },
  {
    id: "recital",
    title: "Play it for someone",
    blurb: "The songs, slowly, all the way through.",
    steps: [
      {
        id: "recital-intro",
        kind: "talk",
        say: "Last lesson for now. Pick a person in the house. Play one song for them, slowly. Mistakes are allowed. Starting again is allowed. I’ll keep you on the rails.",
        hint: "",
        success: "",
      },
      {
        id: "recital-buns",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [...hot, ...hot, ...pennyC, ...pennyD, ...hot],
        lyrics: [...hotWords, ...hotWords, ...pennyCWords, ...pennyDWords, ...hotWords],
        say: "Hot Cross Buns, for your audience. Right hand only.",
        hint: "Finger 3 starts on E.",
        success: "That’s a performance. Short is fine.",
      },
      {
        id: "recital-yankee",
        kind: "phrase",
        position: [...RH_POS, 59],
        fingers: RH_B,
        clef: "treble",
        notes: [...yankeeA, ...yankeeB, ...yankeeC, ...yankeeD],
        lyrics: [...yankeeAWords, ...yankeeBWords, ...yankeeCWords, ...yankeeDWords],
        say: "Yankee Doodle, the one she can already sing.",
        hint: "Two C’s to start. Thumb down only on pony and macaroni.",
        success: "She already knew how it goes. Now her hands do too.",
      },
      {
        id: "recital-mary",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [...maryA, ...maryB, ...maryA, ...maryC],
        lyrics: [...maryAWords, ...maryBWords, ...maryAWords, ...maryCWords],
        say: "If they want an encore: Mary Had a Little Lamb.",
        hint: "Start on E. The word on the screen is your place.",
        success: "Two pieces. Come back tomorrow and play them before breakfast — that’s how they stick.",
      },
    ],
  },
];

export function flattenSteps(): { unit: Unit; step: Step }[] {
  return UNITS.flatMap((unit) => unit.steps.map((step) => ({ unit, step })));
}

export function locate(id: string): {
  unit: Unit;
  step: Step;
  index: number;
  next: { unit: Unit; step: Step } | null;
  prev: { unit: Unit; step: Step } | null;
} | null {
  const all = flattenSteps();
  const index = all.findIndex((item) => item.step.id === id);
  if (index < 0) return null;
  return {
    unit: all[index].unit,
    step: all[index].step,
    index,
    next: all[index + 1] ?? null,
    prev: all[index - 1] ?? null,
  };
}

export function gradedSteps(unit: Unit): Step[] {
  return unit.steps.filter((step) => step.kind !== "talk");
}

export function unitCleared(unit: Unit, completed: string[]): boolean {
  return unit.steps.every((step) => completed.includes(step.id));
}

export function unitUnlocked(unitIndex: number, completed: string[], unlockAll: boolean): boolean {
  if (unlockAll || unitIndex === 0) return true;
  return unitCleared(UNITS[unitIndex - 1], completed);
}

export function firstOpenStep(unit: Unit, completed: string[]): Step {
  return unit.steps.find((step) => !completed.includes(step.id)) ?? unit.steps[0];
}

export function targetOf(step: Step, index: number): number | null {
  if (step.kind === "phrase") return step.notes[index] ?? null;
  if (step.kind === "find" && step.accept.length === 1) return step.accept[0];
  return null;
}

export function highlightOf(step: Step, index: number): number[] {
  if (step.kind === "phrase") {
    const note = step.notes[index];
    return note == null ? [] : [note];
  }
  if (step.kind === "find") return step.accept.filter((midi) => midi >= 48 && midi <= 72);
  return [];
}

export function focusOf(step: Step, index: number): number {
  const target = targetOf(step, index);
  if (target != null) return target;
  if (step.kind === "find" && step.accept.length > 0) {
    return [...step.accept].sort((a, b) => Math.abs(a - 60) - Math.abs(b - 60))[0];
  }
  return 60;
}

export function demoOf(step: Step): number[] {
  if (step.kind === "phrase") return step.notes;
  if (step.kind === "find") {
    return [...step.accept].sort((a, b) => Math.abs(a - 60) - Math.abs(b - 60)).slice(0, 1);
  }
  return [];
}

export function clefFor(step: Step, midi: number | null): Clef | null {
  if (step.kind === "phrase") {
    const notes = step.notes;
    const low = Math.min(...notes);
    const high = Math.max(...notes);
    if (high < 60) return "bass";
    if (low >= 60) return "treble";
    if (midi == null) return null;
    return midi >= 60 ? "treble" : "bass";
  }
  if (step.clef) return step.clef;
  if (midi != null && step.kind === "explore") return midi >= 60 ? "treble" : "bass";
  return null;
}

export function phraseWindow(notes: number[], index: number): { notes: number[]; index: number } | null {
  if (notes.length === 0) return null;
  const mixed = Math.min(...notes) < 60 && Math.max(...notes) >= 60;
  if (mixed) return { notes: [notes[index] ?? notes[0]], index: 0 };
  if (notes.length <= 8) return { notes, index };
  const start = Math.min(Math.max(0, index - 2), notes.length - 8);
  return { notes: notes.slice(start, start + 8), index: index - start };
}
