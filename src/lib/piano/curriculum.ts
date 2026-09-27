import { allOfClass, coachAccept, RANGE_END, RANGE_START } from "./theory";

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
  month?: string;
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
const RH_A: Record<number, string> = { ...RH, 69: "5" };
const RH_HIGH: Record<number, string> = {
  60: "1",
  62: "2",
  64: "1",
  65: "2",
  67: "1",
  69: "2",
  71: "3",
  72: "1",
  74: "2",
  76: "3",
  77: "4",
  79: "5",
};
const SCALE_F: Record<number, string> = {
  60: "1",
  62: "2",
  64: "3",
  65: "1",
  67: "2",
  69: "3",
  71: "4",
  72: "5",
};

const odeA = [64, 64, 65, 67, 67, 65, 64, 62];
const odeAWords = ["Joy-", "ful,", "joy-", "ful,", "we", "a-", "dore", "Thee"];
const odeB = [60, 60, 62, 64, 64, 62, 62];
const odeBWords = ["God", "of", "glo-", "ry,", "Lord", "of", "love"];
const odeC = [64, 64, 65, 67, 67, 65, 64, 62];
const odeCWords = ["Hearts", "un-", "fold", "like", "flowers", "be-", "fore", "Thee"];
const odeD = [60, 60, 62, 64, 62, 60, 60];
const odeDWords = ["Op-", "ening", "to", "the", "sun", "a-", "bove"];

const jacquesA = [60, 62, 64, 60];
const jacquesAWords = ["Are", "you", "sleep-", "ing"];
const jacquesB = [64, 65, 67];
const jacquesBWords = ["Morn-", "ing", "bells"];
const jacquesC = [67, 69, 67, 65, 64, 60];
const jacquesCWords = ["Ding", "dang", "dong", "ding", "dang", "dong"];
const jacquesD = [60, 67, 60];
const jacquesDWords = ["Ding", "dang", "dong"];

const skipDrill = [60, 64, 62, 65, 64, 67, 65, 64, 62, 60];

const lhHot = [52, 50, 48];
const lhPennyC = [48, 48, 48, 48];
const lhPennyD = [50, 50, 50, 50];

const tw1 = [60, 60, 67, 67, 69, 69, 67];
const tw1Words = ["Twin-", "kle,", "twin-", "kle,", "lit-", "tle", "star"];
const tw2 = [65, 65, 64, 64, 62, 62, 60];
const tw2Words = ["How", "I", "won-", "der", "what", "you", "are"];
const tw3 = [67, 67, 65, 65, 64, 64, 62];
const tw3Words = ["Up", "a-", "bove", "the", "world", "so", "high"];

const bridge1 = [67, 69, 67, 65, 64, 65, 67];
const bridge1Words = ["Lon-", "don", "Bridge", "is", "fall-", "ing", "down"];
const bridge2 = [62, 64, 65, 64, 65, 67];
const bridge2Words = ["Fall-", "ing", "down,", "fall-", "ing", "down"];
const bridge4 = [62, 67, 64, 60];
const bridge4Words = ["My", "fair", "la-", "dy"];

const scaleUp = [60, 62, 64, 65, 67, 69, 71, 72];
const scaleDown = [72, 71, 69, 67, 65, 64, 62, 60];
const joy = [72, 71, 69, 67, 65, 64, 62, 60];
const joyWords = ["Joy", "to", "the", "world,", "the", "Lord", "is", "come"];

const jingleA = [64, 64, 64, 64, 64, 64, 64, 67, 72, 74, 76];
const jingleAWords = ["Jin-", "gle", "bells,", "jin-", "gle", "bells,", "jin-", "gle", "all", "the", "way"];
const jingleB = [77, 77, 77, 77, 77, 76, 76, 76, 76, 74, 74, 76, 74, 79];
const jingleBWords = ["Oh", "what", "fun", "it", "is", "to", "ride", "in", "a", "one-", "horse", "o-", "pen", "sleigh"];
const jingleC = [77, 77, 77, 77, 77, 76, 76, 79, 79, 77, 74, 72];
const jingleCWords = ["Oh", "what", "fun", "it", "is", "to", "ride", "in", "a", "one-", "horse", "sleigh"];

const answer = [64, 64, 65, 67, 52, 52, 53, 55];

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
        say: "Last song from the first month. Play one piece for someone at home. Mistakes are allowed. Starting again is allowed.",
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
        success: "Month one is on the piano. Month two starts whenever you want.",
      },
    ],
  },
  {
    id: "steps",
    month: "Month 2",
    title: "Steps and skips",
    blurb: "A step is the next white key. A skip jumps over one.",
    steps: [
      {
        id: "steps-talk",
        kind: "talk",
        say: "A step walks to the next white key. A skip jumps over one white key, like C to E. Same right hand.",
        hint: "",
        success: "",
      },
      {
        id: "steps-walk",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: skipDrill,
        say: "Skip, step, skip, step, then walk home. C to E is a skip. E to D is a step.",
        hint: "Start on middle C. The yellow key is always the next one.",
        success: "Steps and skips. That is how melodies move.",
      },
    ],
  },
  {
    id: "ode",
    month: "Month 2",
    title: "Ode to Joy",
    blurb: "Beethoven’s tune, still in the five fingers.",
    steps: [
      {
        id: "ode-1",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: odeA,
        lyrics: odeAWords,
        say: "Joyful, joyful, we adore Thee. It starts on E and steps up to G.",
        hint: "Finger 3, then 3, 4, 5.",
        success: "First line of Ode to Joy.",
      },
      {
        id: "ode-2",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: odeB,
        lyrics: odeBWords,
        say: "God of glory, Lord of love. It comes home and ends on two D’s.",
        hint: "Thumb on middle C, twice.",
        success: "Second line.",
      },
      {
        id: "ode-3",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: odeC,
        lyrics: odeCWords,
        say: "Hearts unfold like flowers before Thee. Same notes as the first line.",
        hint: "Start on E again.",
        success: "You already knew this shape.",
      },
      {
        id: "ode-4",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: odeD,
        lyrics: odeDWords,
        say: "Opening to the sun above. This one ends on middle C.",
        hint: "The last two notes are both middle C.",
        success: "That’s the verse.",
      },
      {
        id: "ode-all",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [...odeA, ...odeB, ...odeC, ...odeD],
        lyrics: [...odeAWords, ...odeBWords, ...odeCWords, ...odeDWords],
        say: "All of Ode to Joy, slowly.",
        hint: "Start on E.",
        success: "Ode to Joy, beginning to end.",
      },
    ],
  },
  {
    id: "jacques",
    month: "Month 2",
    title: "Are You Sleeping",
    blurb: "A round. The pinky steps up to A.",
    steps: [
      {
        id: "jacques-1",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: jacquesA,
        lyrics: jacquesAWords,
        say: "Are you sleeping. C D E C. Play it, then the same line again is the next step.",
        hint: "Thumb, finger 2, finger 3, thumb.",
        success: "First call.",
      },
      {
        id: "jacques-1b",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: jacquesA,
        lyrics: jacquesAWords,
        say: "Are you sleeping, again.",
        hint: "Same four notes.",
        success: "The song asks twice.",
      },
      {
        id: "jacques-2",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: jacquesB,
        lyrics: jacquesBWords,
        say: "Morning bells. E F G. Brother John uses the same three notes, so play this line twice in the whole song.",
        hint: "Fingers 3, 4, 5.",
        success: "Morning bells.",
      },
      {
        id: "jacques-3",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: jacquesC,
        lyrics: jacquesCWords,
        say: "Ding dang dong. The pinky steps up from G to A, then walks home to C.",
        hint: "A is the next white key above G. Same pinky.",
        success: "The bells.",
      },
      {
        id: "jacques-4",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: jacquesD,
        lyrics: jacquesDWords,
        say: "Ding dang dong, the short one. Middle C, G, middle C.",
        hint: "Thumb, pinky, thumb.",
        success: "Ready for the whole round.",
      },
      {
        id: "jacques-all",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: [...jacquesA, ...jacquesA, ...jacquesB, ...jacquesB, ...jacquesC, ...jacquesC, ...jacquesD, ...jacquesD],
        lyrics: [...jacquesAWords, ...jacquesAWords, ...jacquesBWords, ...jacquesBWords, ...jacquesCWords, ...jacquesCWords, ...jacquesDWords, ...jacquesDWords],
        say: "The whole song. Each line happens twice.",
        hint: "Start on middle C.",
        success: "Are You Sleeping, all the way through.",
      },
    ],
  },
  {
    id: "lh-song",
    month: "Month 2",
    title: "Left hand song",
    blurb: "Hot Cross Buns, one octave lower.",
    steps: [
      {
        id: "lh-buns",
        kind: "phrase",
        position: LH_POS,
        fingers: LH,
        clef: "bass",
        notes: [...lhHot, ...lhHot, ...lhPennyC, ...lhPennyD, ...lhHot],
        lyrics: [...hotWords, ...hotWords, ...pennyCWords, ...pennyDWords, ...hotWords],
        say: "The same song in the left hand. Pinky starts on low E. Low C is the thumb’s opposite: finger 5.",
        hint: "Low E, low D, low C. Fingers 3, 4, 5.",
        success: "Hot Cross Buns in the left hand.",
      },
    ],
  },
  {
    id: "twinkle",
    month: "Month 3",
    title: "Twinkle, Twinkle",
    blurb: "The pinky reaches A. The song you can sing in your sleep.",
    steps: [
      {
        id: "twinkle-a",
        kind: "find",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        accept: [69],
        say: "Find A. It is the white key above G. Pinky steps up from G.",
        hint: "A sits between the top two of the three black keys, one white key higher than G.",
        success: "That’s A.",
      },
      {
        id: "twinkle-1",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: tw1,
        lyrics: tw1Words,
        say: "Twinkle, twinkle, little star. Two C’s, two G’s, two A’s, then G.",
        hint: "Pinky plays G, then steps up for A, then back to G.",
        success: "First line.",
      },
      {
        id: "twinkle-2",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: tw2,
        lyrics: tw2Words,
        say: "How I wonder what you are. It walks down from F to middle C.",
        hint: "Finger 4 starts on F.",
        success: "Home on C.",
      },
      {
        id: "twinkle-3",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: tw3,
        lyrics: tw3Words,
        say: "Up above the world so high. This line also sings like a diamond. Play it again for the next line of the song.",
        hint: "Start on G.",
        success: "The high line.",
      },
      {
        id: "twinkle-all",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: [...tw1, ...tw2, ...tw3, ...tw3, ...tw1, ...tw2],
        lyrics: [...tw1Words, ...tw2Words, ...tw3Words, ...tw3Words, ...tw1Words, ...tw2Words],
        say: "All of Twinkle. The middle line happens twice.",
        hint: "Two middle C’s to start.",
        success: "Twinkle, Twinkle, Little Star.",
      },
    ],
  },
  {
    id: "bridge",
    month: "Month 3",
    title: "London Bridge",
    blurb: "Skips and steps, and one reach to A.",
    steps: [
      {
        id: "bridge-1",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: bridge1,
        lyrics: bridge1Words,
        say: "London Bridge is falling down. G A G, then walk down and back to G.",
        hint: "A is the pinky’s step up.",
        success: "First line.",
      },
      {
        id: "bridge-2",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: bridge2,
        lyrics: bridge2Words,
        say: "Falling down, falling down. It starts on D.",
        hint: "Finger 2 on D.",
        success: "The middle line.",
      },
      {
        id: "bridge-4",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: bridge4,
        lyrics: bridge4Words,
        say: "My fair lady. D G E C.",
        hint: "End on middle C.",
        success: "The ending.",
      },
      {
        id: "bridge-all",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: [...bridge1, ...bridge2, ...bridge1, ...bridge4],
        lyrics: [...bridge1Words, ...bridge2Words, ...bridge1Words, ...bridge4Words],
        say: "The whole rhyme.",
        hint: "Start on G.",
        success: "London Bridge.",
      },
    ],
  },
  {
    id: "sharp",
    month: "Month 3",
    title: "The first black key",
    blurb: "F sharp. The black key just to the right of F.",
    steps: [
      {
        id: "sharp-find",
        kind: "find",
        position: RH_POS,
        fingers: { ...RH, 66: "4" },
        accept: [66],
        say: "Find F sharp. It is the leftmost of the three black keys, right next to F.",
        hint: "Finger 4 can slide from F onto that black key.",
        success: "F sharp.",
      },
      {
        id: "sharp-step",
        kind: "phrase",
        position: [...RH_POS, 66],
        fingers: { ...RH, 66: "4" },
        clef: "treble",
        notes: [65, 66, 67, 66, 65],
        lyrics: ["F", "sharp", "G", "sharp", "F"],
        say: "Step F, F sharp, G, and back. Finger 4 plays F and F sharp.",
        hint: "White, black, white, black, white.",
        success: "You can play a black key on purpose.",
      },
    ],
  },
  {
    id: "scale",
    month: "Month 4",
    title: "The C scale",
    blurb: "Eight notes, thumb tucks under after E.",
    steps: [
      {
        id: "scale-talk",
        kind: "talk",
        say: "A scale is every white key from C up to the next C. After E, the thumb tucks under and plays F. Then the hand opens to high C.",
        hint: "",
        success: "",
      },
      {
        id: "scale-up",
        kind: "phrase",
        position: scaleUp,
        fingers: SCALE_F,
        clef: "treble",
        notes: scaleUp,
        lyrics: ["C", "D", "E", "F", "G", "A", "B", "C"],
        say: "Up the scale. Thumb on F is the tuck.",
        hint: "1 2 3, then thumb again on F.",
        success: "Up to high C.",
      },
      {
        id: "scale-down",
        kind: "phrase",
        position: scaleUp,
        fingers: SCALE_F,
        clef: "treble",
        notes: scaleDown,
        lyrics: ["C", "B", "A", "G", "F", "E", "D", "C"],
        say: "Back down. Finger 5 starts on high C. After F, finger 3 crosses over for E.",
        hint: "Land on middle C.",
        success: "Down the scale.",
      },
    ],
  },
  {
    id: "joy",
    month: "Month 4",
    title: "Joy to the World",
    blurb: "The famous opening. It is the scale, coming down.",
    steps: [
      {
        id: "joy-line",
        kind: "phrase",
        position: scaleUp,
        fingers: SCALE_F,
        clef: "treble",
        notes: joy,
        lyrics: joyWords,
        say: "Joy to the world, the Lord is come. High C, then every white key down to middle C.",
        hint: "Finger 5 on high C.",
        success: "The opening.",
      },
      {
        id: "joy-again",
        kind: "phrase",
        position: scaleUp,
        fingers: SCALE_F,
        clef: "treble",
        notes: [...joy, ...joy],
        lyrics: [...joyWords, ...joyWords],
        say: "Play that line twice, slowly. Same notes both times.",
        hint: "Start on high C each time.",
        success: "Joy to the World, the part everyone knows.",
      },
    ],
  },
  {
    id: "jingle",
    month: "Month 4",
    title: "Jingle Bells",
    blurb: "The chorus. The hand moves higher than middle C.",
    steps: [
      {
        id: "jingle-1",
        kind: "phrase",
        position: [64, 67, 72, 74, 76],
        fingers: RH_HIGH,
        clef: "treble",
        notes: jingleA,
        lyrics: jingleAWords,
        say: "Jingle bells, jingle bells, jingle all the way. It starts on E and climbs to the E above high C.",
        hint: "Three E’s, three E’s, then E G C D E.",
        success: "The first shout.",
      },
      {
        id: "jingle-2",
        kind: "phrase",
        position: [67, 72, 74, 76, 77, 79],
        fingers: RH_HIGH,
        clef: "treble",
        notes: jingleB,
        lyrics: jingleBWords,
        say: "Oh what fun it is to ride in a one-horse open sleigh.",
        hint: "F is a step above that high E.",
        success: "The long line.",
      },
      {
        id: "jingle-3",
        kind: "phrase",
        position: [72, 74, 76, 77, 79],
        fingers: RH_HIGH,
        clef: "treble",
        notes: jingleC,
        lyrics: jingleCWords,
        say: "The ending sleigh. It lands on high C.",
        hint: "Last note is high C.",
        success: "The chorus is in your hand.",
      },
      {
        id: "jingle-all",
        kind: "phrase",
        position: [64, 67, 72, 74, 76, 77, 79],
        fingers: RH_HIGH,
        clef: "treble",
        notes: [...jingleA, ...jingleB, ...jingleA, ...jingleC],
        lyrics: [...jingleAWords, ...jingleBWords, ...jingleAWords, ...jingleCWords],
        say: "The chorus, twice through the jingle bells line.",
        hint: "Start on E.",
        success: "Jingle Bells.",
      },
    ],
  },
  {
    id: "answer",
    month: "Month 4",
    title: "Hands answer",
    blurb: "Right hand plays a line. Left hand answers it, lower.",
    steps: [
      {
        id: "answer-line",
        kind: "phrase",
        position: [...LH_POS, ...RH_POS],
        fingers: BOTH,
        notes: answer,
        lyrics: ["Joy-", "ful", "joy-", "ful", "joy-", "ful", "joy-", "ful"],
        say: "Right hand plays the start of Ode to Joy. Left hand answers with the same shape, lower. One hand at a time.",
        hint: "Right fingers 3 3 4 5, then left fingers 3 3 2 1.",
        success: "Two hands, still one note at a time.",
      },
    ],
  },
  {
    id: "spring",
    month: "Month 5",
    title: "Play three pieces",
    blurb: "Ode to Joy, Twinkle, and Jingle Bells. Pick one for someone.",
    steps: [
      {
        id: "spring-ode",
        kind: "phrase",
        position: RH_POS,
        fingers: RH,
        clef: "treble",
        notes: [...odeA, ...odeB, ...odeC, ...odeD],
        lyrics: [...odeAWords, ...odeBWords, ...odeCWords, ...odeDWords],
        say: "Ode to Joy, for a listener.",
        hint: "Start on E.",
        success: "One piece.",
      },
      {
        id: "spring-twinkle",
        kind: "phrase",
        position: [...RH_POS, 69],
        fingers: RH_A,
        clef: "treble",
        notes: [...tw1, ...tw2, ...tw3, ...tw3, ...tw1, ...tw2],
        lyrics: [...tw1Words, ...tw2Words, ...tw3Words, ...tw3Words, ...tw1Words, ...tw2Words],
        say: "Twinkle, if they want another.",
        hint: "Two middle C’s.",
        success: "Two pieces.",
      },
      {
        id: "spring-jingle",
        kind: "phrase",
        position: [64, 67, 72, 74, 76, 77, 79],
        fingers: RH_HIGH,
        clef: "treble",
        notes: [...jingleA, ...jingleB, ...jingleA, ...jingleC],
        lyrics: [...jingleAWords, ...jingleBWords, ...jingleAWords, ...jingleCWords],
        say: "Jingle Bells, the encore.",
        hint: "Start on E.",
        success: "Three pieces you can play for someone.",
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

export function judgeNote(
  step: Step,
  index: number,
  midi: number,
): { result: "ignore" } | { result: "explore" } | { result: "wrong" } | { result: "advance"; index: number; finished: boolean } {
  if (step.kind === "talk") return { result: "ignore" };
  if (step.kind === "explore") return { result: "explore" };
  if (step.kind === "find") {
    return coachAccept(midi, step.accept) == null ? { result: "advance", index: 0, finished: true } : { result: "wrong" };
  }
  const want = step.notes[index];
  if (want == null) return { result: "ignore" };
  if (midi !== want) return { result: "wrong" };
  const next = index + 1;
  return { result: "advance", index: next, finished: next >= step.notes.length };
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
  if (step.kind === "find") return step.accept.filter((midi) => midi >= RANGE_START && midi <= RANGE_END);
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
