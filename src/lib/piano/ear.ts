import { analyze } from "./pitch";

type NoteHandler = (midi: number) => void;
type LevelHandler = (level: { rms: number; midi: number | null }) => void;

let stream: MediaStream | null = null;
let audio: AudioContext | null = null;
let timer = 0;
let running = false;
let starting: Promise<void> | null = null;
const noteHandlers = new Set<NoteHandler>();
const levelHandlers = new Set<LevelHandler>();

export function earIsOn(): boolean {
  return running;
}

export function onNote(handler: NoteHandler): () => void {
  noteHandlers.add(handler);
  return () => noteHandlers.delete(handler);
}

export function onLevel(handler: LevelHandler): () => void {
  levelHandlers.add(handler);
  return () => levelHandlers.delete(handler);
}

export function stopEar(): void {
  running = false;
  window.clearInterval(timer);
  timer = 0;
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  const closing = audio;
  audio = null;
  if (closing && closing.state !== "closed") void closing.close();
}

export async function startEar(): Promise<void> {
  if (running) return;
  if (starting) return starting;
  starting = openEar().finally(() => {
    starting = null;
  });
  return starting;
}

type Phase = "idle" | "attack" | "confirm" | "held";

/** Turns a stream of pitch frames into one event per key press, including repeats. */
export function createHearer(emit: (midi: number) => void) {
  let floor = 0.004;
  let phase: Phase = "idle";
  let attackLeft = 0;
  let votes: number[] = [];
  let heldMidi: number | null = null;
  let peak = 0;
  let sawDip = false;
  let quiet = 0;
  let nextMidi: number | null = null;
  let nextCount = 0;

  function agreed(list: number[]): number | null {
    if (list.length < 2) return null;
    const last = list[list.length - 1];
    return last === list[list.length - 2] ? last : null;
  }

  return {
    push(frame: { rms: number; midi: number | null; confidence: number }) {
      const gate = Math.max(0.0045, floor * 2.2);
      const loud = frame.rms >= gate;
      if (!loud) {
        floor = floor * 0.95 + frame.rms * 0.05;
        quiet += 1;
        if (quiet >= 3) {
          phase = "idle";
          votes = [];
          heldMidi = null;
          peak = 0;
          sawDip = false;
          nextMidi = null;
          nextCount = 0;
        }
        return;
      }
      quiet = 0;
      const midi = frame.midi != null && frame.confidence >= 0.72 ? frame.midi : null;

      if (phase === "idle") {
        phase = "attack";
        attackLeft = 1;
        votes = [];
        peak = frame.rms;
        sawDip = false;
        nextMidi = null;
        nextCount = 0;
        return;
      }

      if (frame.rms > peak) peak = frame.rms;

      if (phase === "attack") {
        attackLeft -= 1;
        if (attackLeft > 0) return;
        phase = "confirm";
      }

      if (phase === "confirm") {
        if (midi != null) votes.push(midi);
        if (votes.length > 7) votes.shift();
        const chosen = agreed(votes);
        if (chosen == null) return;
        heldMidi = chosen;
        phase = "held";
        peak = frame.rms;
        sawDip = false;
        emit(chosen);
        return;
      }

      if (frame.rms < peak * 0.5) sawDip = true;
      if (midi == null) {
        nextMidi = null;
        nextCount = 0;
        return;
      }
      if (midi === heldMidi) {
        nextMidi = null;
        nextCount = 0;
        if (sawDip && frame.rms > peak * 0.58) {
          sawDip = false;
          peak = frame.rms;
          emit(midi);
        }
        return;
      }
      if (midi === nextMidi) nextCount += 1;
      else {
        nextMidi = midi;
        nextCount = 1;
      }
      if (nextCount >= 2) {
        heldMidi = midi;
        nextCount = 0;
        nextMidi = null;
        sawDip = false;
        peak = frame.rms;
        votes = [midi, midi, midi];
        emit(midi);
      }
    },
  };
}

async function openEar(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser doesn't have a microphone.");
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
  } catch {
    throw new Error("The browser didn't share the microphone. Allow it, then tap Listen again.");
  }

  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  audio = new AC();
  await audio.resume();
  const analyser = audio.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0;
  audio.createMediaStreamSource(stream).connect(analyser);
  const buffer = new Float32Array(analyser.fftSize);
  running = true;

  const hearer = createHearer((midi) => {
    for (const handler of noteHandlers) handler(midi);
  });

  timer = window.setInterval(() => {
    if (!running || !audio) return;
    if (audio.state === "suspended") void audio.resume();
    analyser.getFloatTimeDomainData(buffer);
    const hit = analyze(buffer, audio.sampleRate);
    for (const handler of levelHandlers) handler({ rms: hit.rms, midi: hit.pitch?.midi ?? null });
    hearer.push({
      rms: hit.rms,
      midi: hit.pitch?.midi ?? null,
      confidence: hit.pitch?.confidence ?? 0,
    });
  }, 50);
}
