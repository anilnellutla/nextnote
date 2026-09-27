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

type PhaseFrame = { rms: number; midi: number | null; confidence: number };

/** One event per key press. A clear note counts on the next matching frame, so it stays quick without guessing on the attack. */
export function createHearer(emit: (midi: number) => void) {
  let floor = 0.001;
  let quiet = 0;
  let held: number | null = null;
  let pending: number | null = null;
  let peak = 0;
  let dipped = false;

  return {
    push(frame: PhaseFrame) {
      const gate = Math.max(0.0024, floor * 1.7);
      if (frame.rms < gate) {
        floor = Math.min(0.02, floor * 0.9 + frame.rms * 0.1);
        quiet += 1;
        pending = null;
        if (quiet >= 2) {
          held = null;
          dipped = false;
          peak = 0;
        }
        return;
      }
      quiet = 0;
      if (peak > 0 && frame.rms < peak * 0.48) dipped = true;
      if (frame.rms > peak) peak = frame.rms;

      const midi = frame.midi;
      const usable = midi != null && midi >= 36 && midi <= 84 && frame.confidence >= 0.55;
      if (!usable || midi == null) {
        if (frame.confidence < 0.55) floor = Math.min(frame.rms, floor * 0.97 + frame.rms * 0.03);
        pending = null;
        return;
      }

      if (held == null) {
        if (pending === midi) {
          emit(midi);
          held = midi;
          pending = null;
          dipped = false;
          peak = frame.rms;
        } else {
          pending = midi;
        }
        return;
      }

      if (midi === held) {
        pending = null;
        if (dipped && frame.rms > peak * 0.62) {
          emit(midi);
          dipped = false;
          peak = frame.rms;
        }
        return;
      }

      if (pending === midi) {
        emit(midi);
        held = midi;
        pending = null;
        dipped = false;
        peak = frame.rms;
      } else {
        pending = midi;
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
  analyser.fftSize = 2048;
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
  }, 20);
}
