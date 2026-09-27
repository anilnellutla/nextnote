import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Laptop,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Star,
  Volume2,
} from "lucide-react";
import { BlackKeyGuide, Keyboard } from "@/components/piano/keyboard";
import { Staff } from "@/components/piano/staff";
import {
  UNITS,
  clefFor,
  demoOf,
  focusOf,
  gradedSteps,
  highlightOf,
  locate,
  phraseWindow,
  targetOf,
  unitCleared,
  type Step,
} from "@/lib/piano/curriculum";
import { earIsOn, onLevel, onNote, startEar, stopEar } from "@/lib/piano/ear";
import { playNote, playSequence, playYes, resumeSynth } from "@/lib/piano/synth";
import { useStudio, type PracticeMode } from "@/lib/piano/store";
import { coach, coachAccept, howToFind, kidName, letterOf } from "@/lib/piano/theory";

const KEY_MAP: Record<string, number> = {
  KeyZ: 48,
  KeyX: 50,
  KeyC: 52,
  KeyV: 53,
  KeyB: 55,
  KeyN: 57,
  KeyM: 59,
  KeyA: 60,
  KeyW: 61,
  KeyS: 62,
  KeyE: 63,
  KeyD: 64,
  KeyF: 65,
  KeyT: 66,
  KeyG: 67,
  KeyY: 68,
  KeyH: 69,
  KeyU: 70,
  KeyJ: 71,
  KeyK: 72,
};

type View = "choose" | "check" | "path" | "lesson";

function NoteRibbon({
  notes,
  index,
  fingers,
  hint,
}: {
  notes: number[];
  index: number;
  fingers?: Record<number, string>;
  hint: boolean;
}) {
  const start = Math.max(0, index - 1);
  const slice = notes.slice(start, Math.min(notes.length, index + 4));
  return (
    <div className="note-ribbon">
      {slice.map((midi, offset) => {
        const at = start + offset;
        const state = at < index ? "is-done" : at === index ? (hint ? "is-now" : "is-wait") : "";
        return (
          <div key={`${at}-${midi}`} className={`note-tile ${state}`}>
            <span className="font-display text-2xl font-semibold leading-none">{letterOf(midi).replace("#", "♯")}</span>
            {fingers?.[midi] ? <span className="text-xs font-extrabold">Finger {fingers[midi]}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function starsFor(mistakes: number): number {
  if (mistakes <= 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

export function Studio() {
  const mode = useStudio((s) => s.mode);
  const hydrate = useStudio((s) => s.hydrate);
  const setMode = useStudio((s) => s.setMode);
  const [view, setView] = useState<View>("choose");
  const [stepId, setStepId] = useState(UNITS[0].steps[0].id);
  const [parents, setParents] = useState(false);

  useEffect(() => {
    hydrate();
    const saved = useStudio.getState();
    if (saved.lastStepId && locate(saved.lastStepId)) setStepId(saved.lastStepId);
    if (saved.mode) setView("path");
    return () => stopEar();
  }, [hydrate]);

  function pick(next: PracticeMode) {
    setMode(next);
    if (next === "screen") stopEar();
    if (next === "acoustic" && !useStudio.getState().micReady) setView("check");
    else setView("path");
  }

  function openStep(id: string) {
    setStepId(id);
    useStudio.getState().rememberStep(id);
    setView("lesson");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-ink">
      {view === "choose" ? <Choose onPick={pick} /> : null}
      {view === "check" ? (
        <MicCheck
          onReady={() => setView("path")}
          onScreen={() => pick("screen")}
          onBack={() => setView(mode ? "path" : "choose")}
        />
      ) : null}
      {view === "path" ? (
        <Path
          onOpen={openStep}
          onChoose={() => setView("choose")}
          onCheck={() => setView("check")}
          onParents={() => setParents(true)}
        />
      ) : null}
      {view === "lesson" ? (
        <LessonRoom
          stepId={stepId}
          onChangeStep={openStep}
          onExit={() => setView("path")}
          onCheck={() => setView("check")}
        />
      ) : null}
      {parents ? (
        <Parents
          onClose={() => setParents(false)}
          onReset={() => {
            stopEar();
            useStudio.getState().reset();
            setView("choose");
            setParents(false);
          }}
        />
      ) : null}
    </main>
  );
}

function Choose({ onPick }: { onPick: (mode: PracticeMode) => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8 md:px-8 md:py-12">
      <p className="text-sm font-extrabold tracking-wide text-felt">Piano lessons</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-walnut md:text-5xl">Next Note</h1>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink">
        One step at a time, the way a teacher sits beside the bench. She listens to the real piano, names the note, and says what to fix.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <img
          src="/aria.jpg"
          alt="Piano teacher"
          className="size-20 rounded-full object-cover shadow-card ring-2 ring-walnut/15"
        />
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          We’ll start with the map of the keys, then the right hand, then a song you can play tonight.
        </p>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onPick("acoustic")}
          className="flex min-h-11 flex-col items-start gap-3 rounded-card bg-felt p-5 text-left text-ivory shadow-card"
        >
          <Mic className="size-6" aria-hidden="true" />
          <span className="font-display text-2xl font-semibold">Our piano</span>
          <span className="text-sm leading-relaxed text-ivory/90">
            The real one in the room. Set this device on the music stand. I listen through the microphone and coach each note.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onPick("screen")}
          className="flex min-h-11 flex-col items-start gap-3 rounded-card border border-line bg-ivory p-5 text-left text-ink shadow-card"
        >
          <Laptop className="size-6 text-walnut" aria-hidden="true" />
          <span className="font-display text-2xl font-semibold text-walnut">On the screen</span>
          <span className="text-sm leading-relaxed text-muted">
            Same lessons, tapping keys here. Useful for a noisy room, or for trying a step before you sit down at the piano.
          </span>
        </button>
      </div>
    </div>
  );
}

function MicCheck({
  onReady,
  onScreen,
  onBack,
}: {
  onReady: () => void;
  onScreen: () => void;
  onBack: () => void;
}) {
  const setMicReady = useStudio((s) => s.setMicReady);
  const [listening, setListening] = useState(earIsOn);
  const [error, setError] = useState("");
  const [heard, setHeard] = useState<number | null>(null);
  const [log, setLog] = useState<number[]>([]);

  useEffect(() => {
    return onNote((midi) => {
      setHeard(midi);
      setLog((prev) => [...prev.slice(-3), midi]);
      setMicReady();
    });
  }, [setMicReady]);

  async function listen() {
    setError("");
    try {
      resumeSynth();
      await startEar();
      setListening(true);
    } catch (err) {
      setListening(false);
      setError(err instanceof Error ? err.message : "The microphone didn't start.");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6 md:py-10">
      <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-2 text-sm font-bold text-walnut">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>
      <h1 className="mt-4 font-display text-3xl font-semibold text-walnut">Can I hear the piano?</h1>
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-ink">
        <li>Set this device on the music stand, screen facing the bench. Don’t cover the microphone.</li>
        <li>If the piano has a top lid, prop it open a little.</li>
        <li>Keep the room quiet. One player, one note at a time.</li>
        <li>Tap Listen, then play any key near the middle of the piano.</li>
      </ol>
      <div className="mt-6 rounded-card bg-ivory p-6 text-center shadow-card" aria-live="polite">
        <p className="text-sm font-bold text-muted">{listening ? "I hear" : "Not listening yet"}</p>
        <p className="mt-2 font-display text-4xl font-semibold text-ink">{heard == null ? "—" : kidName(heard)}</p>
        {log.length > 1 ? (
          <p className="mt-3 text-sm text-muted">{log.map((midi) => kidName(midi)).join(" · ")}</p>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm font-bold text-walnut">{error}</p> : null}
      <div className="mt-5 flex flex-col gap-2">
        {!listening ? (
          <button type="button" onClick={() => void listen()} className="min-h-11 rounded-xl bg-felt px-4 py-3 font-extrabold text-ivory">
            Listen to the piano
          </button>
        ) : (
          <button
            type="button"
            disabled={heard == null}
            onClick={onReady}
            className="min-h-11 rounded-xl bg-felt px-4 py-3 font-extrabold text-ivory disabled:opacity-50"
          >
            I can hear you — start the lessons
          </button>
        )}
        <button type="button" onClick={onScreen} className="min-h-11 rounded-xl px-4 py-3 text-sm font-bold text-walnut">
          Practice on the screen instead
        </button>
      </div>
    </div>
  );
}

function stepLabel(step: Step): string {
  const text = (step.sayScreen ?? step.say).split(". ")[0];
  return text.length > 84 ? `${text.slice(0, 81)}…` : text;
}

function Path({
  onOpen,
  onChoose,
  onCheck,
  onParents,
}: {
  onOpen: (id: string) => void;
  onChoose: () => void;
  onCheck: () => void;
  onParents: () => void;
}) {
  const mode = useStudio((s) => s.mode);
  const completed = useStudio((s) => s.completed);
  const stars = useStudio((s) => s.stars);
  const lastStepId = useStudio((s) => s.lastStepId);
  const clearSteps = useStudio((s) => s.clearSteps);
  const resetProgress = useStudio((s) => s.resetProgress);
  const resume = lastStepId ? locate(lastStepId) : null;
  const [confirm, setConfirm] = useState<null | "all" | string>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-6 md:px-8 md:py-10">
      <div className="flex items-center gap-3">
        <img src="/aria.jpg" alt="" className="size-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-walnut">Lessons</h1>
          <p className="text-sm text-muted">
            {mode === "acoustic" ? "Listening to our piano" : "Practicing on the screen"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirm("all")}
          className="min-h-11 shrink-0 rounded-xl border border-line bg-ivory px-3 text-sm font-extrabold text-walnut"
        >
          Reset progress
        </button>
      </div>
      {resume ? (
        <button
          type="button"
          onClick={() => onOpen(resume.step.id)}
          className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-card bg-felt px-4 py-3 text-left text-ivory"
        >
          <span>
            <span className="block text-xs font-bold text-ivory/80">Continue</span>
            <span className="font-display text-lg">{resume.unit.title}</span>
          </span>
          <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
        </button>
      ) : null}
      <ol className="mt-5 flex flex-col gap-3">
        {UNITS.map((unit, index) => {
          const done = unitCleared(unit, completed);
          const graded = gradedSteps(unit);
          const earned = graded.reduce((sum, step) => sum + (stars[step.id] ?? 0), 0);
          const doneCount = unit.steps.filter((step) => completed.includes(step.id)).length;
          return (
            <li key={unit.id} className="rounded-card border border-line bg-ivory shadow-card">
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper font-display text-lg text-walnut">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-tight text-ink">{unit.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{unit.blurb}</span>
                  <span className="mt-1 block text-xs font-bold text-felt">
                    {done ? "Done" : `${doneCount} of ${unit.steps.length}`}
                    {graded.length > 0 ? ` · ${earned}/${graded.length * 3} stars` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setConfirm(unit.id)}
                  className="min-h-11 shrink-0 rounded-xl px-2 text-sm font-extrabold text-walnut"
                >
                  Reset
                </button>
              </div>
              <div className="border-t border-line">
                {unit.steps.map((step, stepIndex) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onOpen(step.id)}
                    className="flex min-h-11 w-full items-center gap-3 border-t border-line px-4 text-left first:border-t-0"
                  >
                    <span className="w-5 shrink-0 text-sm font-extrabold text-muted">{stepIndex + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{stepLabel(step)}</span>
                    {completed.includes(step.id) ? <span className="shrink-0 text-xs font-extrabold text-felt">Done</span> : null}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={onChoose} className="min-h-11 rounded-xl px-3 text-sm font-bold text-walnut">
          Switch piano or screen
        </button>
        {mode === "acoustic" ? (
          <button type="button" onClick={onCheck} className="min-h-11 rounded-xl px-3 text-sm font-bold text-walnut">
            Check the microphone
          </button>
        ) : null}
        <button type="button" onClick={onParents} className="min-h-11 rounded-xl px-3 text-sm font-bold text-muted">
          For parents
        </button>
      </div>
      {confirm ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-4 md:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-card bg-ivory p-5 shadow-card">
            <h2 className="font-display text-2xl text-ink">{confirm === "all" ? "Reset all progress?" : "Reset this lesson?"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {confirm === "all"
                ? "Stars and finished lessons will be cleared. Piano or screen stays as it is."
                : "Stars for this lesson will be cleared so it can be played from the start."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm === "all") resetProgress();
                  else {
                    const unit = UNITS.find((item) => item.id === confirm);
                    if (unit) clearSteps(unit.steps.map((step) => step.id));
                  }
                  setConfirm(null);
                }}
                className="min-h-11 rounded-xl bg-felt px-4 py-2 font-extrabold text-ivory"
              >
                Reset
              </button>
              <button type="button" onClick={() => setConfirm(null)} className="min-h-11 rounded-xl px-3 py-2 text-sm font-bold text-walnut">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LessonRoom({
  stepId,
  onChangeStep,
  onExit,
  onCheck,
}: {
  stepId: string;
  onChangeStep: (id: string) => void;
  onExit: () => void;
  onCheck: () => void;
}) {
  const place = locate(stepId);
  const mode = useStudio((s) => s.mode);
  const mark = useStudio((s) => s.mark);
  const setMode = useStudio((s) => s.setMode);

  const [index, setIndex] = useState(0);
  const [reply, setReply] = useState("");
  const [tone, setTone] = useState<"idle" | "good" | "fix">("idle");
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [holding, setHolding] = useState(false);
  const [listening, setListening] = useState(earIsOn);
  const [earError, setEarError] = useState("");
  const [heard, setHeard] = useState<number | null>(null);
  const [hearing, setHearing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resetAsk, setResetAsk] = useState(false);
  const [hintOn, setHintOn] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);

  const indexRef = useRef(0);
  const doneRef = useRef(false);
  const holdRef = useRef(false);
  const mistakesRef = useRef(0);
  const advancing = useRef(false);
  const pausedRef = useRef(false);
  const ignoreUntil = useRef(0);
  const modeRef = useRef(mode);
  const onChangeRef = useRef(onChangeStep);
  const onExitRef = useRef(onExit);
  const markRef = useRef(mark);
  modeRef.current = mode;
  pausedRef.current = paused;
  onChangeRef.current = onChangeStep;
  onExitRef.current = onExit;
  markRef.current = mark;
  holdRef.current = holding;

  const step = place?.step;
  const stepRef = useRef<Step | null>(step ?? null);
  stepRef.current = step ?? null;

  useEffect(() => {
    setIndex(0);
    indexRef.current = 0;
    setReply("");
    setTone("idle");
    setDone(false);
    doneRef.current = false;
    setEarned(0);
    mistakesRef.current = 0;
    advancing.current = false;
    setPaused(false);
    setHintOn(false);
    setWrong(null);
    if (step) useStudio.getState().rememberStep(step.id);
  }, [stepId, step]);

  useEffect(() => {
    const current = stepRef.current;
    if (!current || current.kind === "talk" || current.kind === "explore" || done) return;
    setHintOn(false);
    setWrong(null);
    const timer = window.setTimeout(() => setHintOn(true), 900);
    return () => window.clearTimeout(timer);
  }, [stepId, index, done]);

  useEffect(() => {
    const offNote = onNote((midi) => {
      if (modeRef.current !== "acoustic") return;
      if (performance.now() < ignoreUntil.current) return;
      setHeard(midi);
      grade(midi);
    });
    const offLevel = onLevel(({ rms }) => {
      const loud = rms >= 0.005;
      setHearing((prev) => (prev === loud ? prev : loud));
    });
    return () => {
      offNote();
      offLevel();
    };
  }, []);

  useEffect(() => {
    if (mode !== "screen") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const midi = KEY_MAP[event.code];
      if (!midi) return;
      event.preventDefault();
      playNote(midi);
      grade(midi);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  useEffect(() => {
    const current = stepRef.current;
    if (!current) return;
    const midi = focusOf(current, index);
    const el = document.querySelector<HTMLElement>(`[data-midi="${midi}"]`);
    const scroller = el?.closest(".piano-scroll");
    if (!el || !(scroller instanceof HTMLElement)) return;
    const host = el.offsetParent instanceof HTMLElement ? el.offsetParent : el;
    scroller.scrollTo({
      left: Math.max(0, host.offsetLeft + el.offsetLeft - scroller.clientWidth / 2),
      behavior: "smooth",
    });
  }, [stepId, index]);

  function goNext() {
    const current = stepRef.current;
    if (!current) return;
    const here = locate(current.id);
    if (!here) return;
    if (current.kind === "talk") markRef.current(current.id, 0);
    if (current.kind === "explore") markRef.current(current.id, 3);
    if (here.next) onChangeRef.current(here.next.step.id);
    else onExitRef.current();
  }

  function grade(midi: number) {
    if (pausedRef.current || holdRef.current || doneRef.current || advancing.current) return;
    const current = stepRef.current;
    if (!current || current.kind === "talk") return;
    setHeard(midi);

    if (current.kind === "explore") {
      setFlash(midi);
      window.setTimeout(() => setFlash((prev) => (prev === midi ? null : prev)), 280);
      setReply(`That's ${kidName(midi)}. ${howToFind(midi)}`);
      setTone("idle");
      return;
    }

    if (current.kind === "find") {
      const message = coachAccept(midi, current.accept);
      if (message == null) {
        playYes();
        ignoreUntil.current = performance.now() + 420;
        setWrong(null);
        setFlash(midi);
        window.setTimeout(() => setFlash((prev) => (prev === midi ? null : prev)), 280);
        const stars = starsFor(mistakesRef.current);
        setEarned(stars);
        setReply(current.success);
        setTone("good");
        markRef.current(current.id, stars);
        advancing.current = true;
        window.setTimeout(() => {
          advancing.current = false;
          goNext();
        }, 900);
      } else {
        mistakesRef.current += 1;
        setWrong(midi);
        setHintOn(true);
        const only = current.accept.length === 1 ? current.accept[0] : null;
        const finger = only != null ? current.fingers?.[only] : undefined;
        setReply(finger ? `${message} Finger ${finger}.` : message);
        setTone("fix");
      }
      return;
    }

    const want = current.notes[indexRef.current];
    if (want == null) return;
    if (midi === want) {
      playYes();
      ignoreUntil.current = performance.now() + 420;
      setWrong(null);
      setFlash(midi);
      window.setTimeout(() => setFlash((prev) => (prev === midi ? null : prev)), 280);
      const atEnd = indexRef.current + 1 >= current.notes.length;
      if (atEnd) {
        const stars = starsFor(mistakesRef.current);
        setEarned(stars);
        setDone(true);
        doneRef.current = true;
        setReply(current.success);
        setTone("good");
        markRef.current(current.id, stars);
      } else {
        const nextIndex = indexRef.current + 1;
        indexRef.current = nextIndex;
        setIndex(nextIndex);
        const nextNote = current.notes[nextIndex];
        const word = current.lyrics?.[nextIndex];
        if (nextNote === midi) setReply("Yes. Let the key up, then play that note again.");
        else setReply(word ? `Yes. ${word}` : "Yes.");
        setTone("good");
      }
      return;
    }
    mistakesRef.current += 1;
    setWrong(midi);
    setHintOn(true);
    const finger = current.fingers?.[want];
    const word = current.lyrics?.[indexRef.current];
    const extra = [finger ? `Finger ${finger}.` : "", word ? `The word is "${word}".` : ""].filter(Boolean).join(" ");
    setReply(extra ? `${coach(midi, want)} ${extra}` : coach(midi, want));
    setTone("fix");
  }

  async function hear() {
    const current = stepRef.current;
    if (!current || holding) return;
    const notes = demoOf(current);
    if (notes.length === 0) return;
    setHolding(true);
    holdRef.current = true;
    try {
      await playSequence(notes, (midi) => setFlash(midi));
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 450));
      holdRef.current = false;
      setHolding(false);
    }
  }

  async function listen() {
    setEarError("");
    try {
      resumeSynth();
      await startEar();
      setListening(true);
    } catch (err) {
      setListening(false);
      setEarError(err instanceof Error ? err.message : "The microphone didn't start.");
    }
  }

  function restart() {
    indexRef.current = 0;
    setIndex(0);
    mistakesRef.current = 0;
    setDone(false);
    doneRef.current = false;
    setEarned(0);
    setReply("");
    setTone("idle");
  }

  if (!place || !step) {
    return (
      <div className="p-6">
        <button type="button" onClick={onExit} className="font-bold text-walnut">
          Back to lessons
        </button>
      </div>
    );
  }

  const phraseIndex = done && step.kind === "phrase" ? step.notes.length - 1 : index;
  const highlights = highlightOf(step, phraseIndex);
  const say = mode === "screen" && step.sayScreen ? step.sayScreen : step.say;
  const target = targetOf(step, done && step.kind === "phrase" ? step.notes.length - 1 : index);
  const clef = clefFor(step, step.kind === "explore" ? heard : target);
  let staffNotes: number[] = [];
  let staffIndex = 0;
  if (step.kind === "phrase" && clef) {
    const windowed = phraseWindow(step.notes, done ? step.notes.length - 1 : index);
    if (windowed) {
      staffNotes = windowed.notes;
      staffIndex = windowed.index;
    }
  } else if (step.kind === "find" && step.accept.length === 1 && clef) {
    staffNotes = [step.accept[0]];
  } else if (step.kind === "explore" && heard != null && clef) {
    staffNotes = [heard];
  }
  const lyric = step.kind === "phrase" ? step.lyrics?.[done ? step.lyrics.length - 1 : index] : null;
  const fingerNow = target != null ? step.fingers?.[target] : undefined;
  const stepNumber = place.unit.steps.findIndex((item) => item.id === step.id) + 1;
  const replyClass = tone === "good" ? "text-yes" : tone === "fix" ? "text-walnut" : "text-ink";
  const showHint = hintOn && !done && step.kind !== "talk" && step.kind !== "explore";
  const ribbonNotes = step.kind === "phrase" ? step.notes : step.kind === "find" ? [step.accept[0]] : [];

  if (step.kind === "talk") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onExit} className="flex size-11 items-center justify-center rounded-full bg-ivory text-walnut" aria-label="Back to lessons">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setResetAsk(true)}
            className="ml-auto min-h-11 rounded-xl border border-line bg-ivory px-3 text-sm font-extrabold text-walnut"
          >
            Reset
          </button>
        </div>
        <p className="mt-6 text-sm font-extrabold text-felt">
          {place.unit.title} · {stepNumber} of {place.unit.steps.length}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{say}</h1>
        {step.guide ? <BlackKeyGuide group={step.guide} /> : null}
        <button type="button" onClick={goNext} className="mt-8 min-h-11 rounded-xl bg-felt px-5 py-3 font-extrabold text-ivory">
          {place.next ? "Continue" : "Finish"}
        </button>
        {resetAsk ? (
          <ResetSheet
            onLesson={() => {
              useStudio.getState().clearSteps([step.id]);
              setResetAsk(false);
            }}
            onAll={() => {
              useStudio.getState().resetProgress();
              setResetAsk(false);
              onExit();
            }}
            onClose={() => setResetAsk(false)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full min-w-0 max-w-5xl flex-col">
      <header className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          onClick={() => setPaused(true)}
          className="flex size-11 items-center justify-center rounded-full bg-ivory text-ink"
          aria-label="Pause"
        >
          <Pause className="size-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-tight text-ink">{place.unit.title}</p>
          <p className="text-xs font-bold text-muted">
            Waits for you · {stepNumber} of {place.unit.steps.length}
            {step.kind === "phrase" ? ` · note ${index + 1} of ${step.notes.length}` : ""}
          </p>
        </div>
        {mode === "acoustic" && listening ? <span className="listening-dot size-2 rounded-full bg-felt" /> : null}
        <button
          type="button"
          onClick={() => setResetAsk(true)}
          className="min-h-11 shrink-0 rounded-xl border border-line bg-ivory px-3 text-sm font-extrabold text-walnut"
        >
          Reset
        </button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-2">
        <p className="max-w-xl text-center text-base font-bold leading-snug text-ink">{say}</p>
        {clef && staffNotes.length > 0 ? <Staff notes={staffNotes} index={staffIndex} clef={clef} /> : null}
        {step.guide ? <BlackKeyGuide group={step.guide} /> : null}
        {ribbonNotes.length > 0 ? (
          <NoteRibbon notes={ribbonNotes} index={step.kind === "phrase" ? index : 0} fingers={step.fingers} hint={showHint} />
        ) : (
          <p className="font-display text-5xl font-semibold text-walnut">{heard != null ? kidName(heard) : "Play one key"}</p>
        )}
        {lyric ? <p className="font-display text-3xl font-semibold text-walnut">{lyric}</p> : null}
        {fingerNow && showHint ? <p className="text-sm font-extrabold text-felt">Finger {fingerNow}</p> : null}
        {reply ? (
          <p className={`text-center text-base font-bold ${replyClass}`} aria-live="polite">
            {reply}
          </p>
        ) : null}
        {done && earned > 0 ? <Stars n={earned} /> : null}
        <div className="flex flex-wrap justify-center gap-2">
          {!showHint && !done && step.kind !== "explore" ? (
            <button type="button" onClick={() => setHintOn(true)} className="min-h-11 rounded-xl bg-amber px-4 py-2 font-extrabold text-ink">
              Show the yellow key
            </button>
          ) : null}
          {done || step.kind === "explore" ? (
            <button type="button" onClick={goNext} className="min-h-11 rounded-xl bg-felt px-4 py-2 font-extrabold text-ivory">
              {place.next ? "Continue" : "Finish"}
            </button>
          ) : null}
        </div>
      </section>

      <div className="min-w-0 px-3 pb-4">
        {mode === "acoustic" && listening ? (
          <p className="mb-2 text-center text-sm font-extrabold text-ink" aria-live="polite">
            {hearing
              ? heard != null
                ? `Hearing ${kidName(heard)}. Let the key up before the next note.`
                : "I hear sound. Play one note and let it go."
              : "Listening. Play one note, a little closer if I stay quiet."}
          </p>
        ) : null}
        {mode === "acoustic" && !listening ? (
          <div className="mb-3 rounded-xl bg-ivory p-3 shadow-card">
            <p className="text-sm text-ink">Tap Listen, then play the note on your piano. The song will wait.</p>
            {earError ? <p className="mt-1 text-sm font-bold text-walnut">{earError}</p> : null}
            <button type="button" onClick={() => void listen()} className="mt-2 min-h-11 rounded-xl bg-felt px-4 py-2 font-extrabold text-ivory">
              Listen
            </button>
          </div>
        ) : null}
        <Keyboard
          fingers={showHint ? step.fingers : undefined}
          position={step.position}
          targets={showHint ? highlights : []}
          heard={wrong}
          flash={flash}
          interactive={mode === "screen" && !paused}
          onPlay={grade}
        />
        <p className="mt-2 text-center text-sm text-muted">
          {mode === "acoustic"
            ? "Grey is what I heard. Yellow is the note to play. Blue means it was right."
            : "Tap the key. Yellow is the hint. Blue means it was right."}
        </p>
      </div>

      {resetAsk ? (
        <ResetSheet
          onLesson={() => {
            useStudio.getState().clearSteps([step.id]);
            restart();
            setResetAsk(false);
            setPaused(false);
          }}
          onAll={() => {
            useStudio.getState().resetProgress();
            setResetAsk(false);
            onExit();
          }}
          onClose={() => setResetAsk(false)}
        />
      ) : null}
      {paused ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-4 md:items-center">
          <div className="w-full max-w-sm rounded-card bg-ivory p-5 shadow-card">
            <h2 className="font-display text-2xl text-ink">Paused</h2>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={() => setPaused(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-felt font-extrabold text-ivory">
                <Play className="size-4" aria-hidden="true" />
                Continue
              </button>
              {demoOf(step).length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setPaused(false);
                    void hear();
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber font-extrabold text-ink"
                >
                  <Volume2 className="size-4" aria-hidden="true" />
                  Hear it
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  useStudio.getState().clearSteps([step.id]);
                  restart();
                  setPaused(false);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-bold text-walnut"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset this lesson
              </button>
              <button type="button" onClick={onExit} className="min-h-11 font-bold text-muted">
                Back to lessons
              </button>
              {mode === "acoustic" ? (
                <button type="button" onClick={onCheck} className="min-h-11 text-sm font-bold text-walnut">
                  Microphone setup
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResetSheet({
  onLesson,
  onAll,
  onClose,
}: {
  onLesson: () => void;
  onAll: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="reset-title">
      <div className="w-full max-w-sm rounded-card bg-ivory p-5 shadow-card">
        <h2 id="reset-title" className="font-display text-2xl text-ink">
          Reset
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">Choose what to clear. This cannot be undone.</p>
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" onClick={onLesson} className="min-h-11 rounded-xl bg-felt font-extrabold text-ivory">
            This lesson
          </button>
          <button type="button" onClick={onAll} className="min-h-11 rounded-xl border border-line font-extrabold text-ink">
            All progress
          </button>
          <button type="button" onClick={onClose} className="min-h-11 font-bold text-walnut">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <p className="mt-3 flex gap-1" aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((star) => (
        <Star key={star} className={star <= n ? "size-5 fill-amber text-amber" : "size-5 text-line"} aria-hidden="true" />
      ))}
    </p>
  );
}

function Parents({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="parents-title">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card bg-ivory p-5 shadow-card">
        <h2 id="parents-title" className="font-display text-2xl font-semibold text-walnut">
          For parents
        </h2>
        <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <p>
            Put a phone or tablet on the music stand, screen toward her, microphone facing the strings. An upright works. A grand works better with the lid propped. One note at a time — the app is listening for a single pitch, the way a first teacher waits.
          </p>
          <p>
            She will say the note she heard, whether it was the right octave, and which way to move. She cannot see curved fingers, the bench, or stiff wrists. Those lines in the lessons are hers to feel, not something the app can check.
          </p>
          <p>
            If the room is loud or a note isn’t picked up, move the device closer and play a bit firmer. The on-screen keys are the same lessons without a microphone.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-felt px-4 py-2 font-extrabold text-ivory">
            Close
          </button>
          <button type="button" onClick={onReset} className="min-h-11 rounded-xl px-3 py-2 text-sm font-bold text-walnut">
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
