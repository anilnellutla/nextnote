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

/** One event per key press. A clear note counts immediately. A softer one counts once it repeats, and a noisy frame in between does not cancel it. */
export function createHearer(emit: (midi: number) => void) {
  let floor = 0.0008;
  let quiet = 0;
  let held: number | null = null;
  let pending: number | null = null;
  let pendingHits = 0;
  let peak = 0;
  let dipped = false;
  let miss = 0;

  return {
    push(frame: PhaseFrame) {
      const gate = Math.max(0.001, floor * 1.15);
      if (frame.rms < gate) {
        floor = Math.min(0.008, floor * 0.96 + frame.rms * 0.04);
        quiet += 1;
        if (quiet >= 3) {
          held = null;
          pending = null;
          pendingHits = 0;
          dipped = false;
          peak = 0;
          miss = 0;
        }
        return;
      }
      quiet = 0;
      if (peak > 0 && frame.rms < peak * 0.42) dipped = true;
      if (frame.rms > peak) peak = frame.rms;

      const midi = frame.midi;
      const ok = midi != null && midi >= 36 && midi <= 84 && frame.confidence >= 0.48;
      if (!ok || midi == null) {
        miss += 1;
        if (miss >= 5) {
          pending = null;
          pendingHits = 0;
        }
        return;
      }
      miss = 0;
      const strong = frame.confidence >= 0.8;

      if (held == null) {
        if (strong || (pending === midi && pendingHits >= 1)) {
          emit(midi);
          held = midi;
          pending = null;
          pendingHits = 0;
          dipped = false;
          peak = frame.rms;
          return;
        }
        pending = midi;
        pendingHits = 1;
        return;
      }

      if (midi === held) {
        pending = null;
        pendingHits = 0;
        if (dipped && frame.rms > peak * 0.55) {
          emit(midi);
          dipped = false;
          peak = frame.rms;
        }
        return;
      }

      if (strong || (pending === midi && pendingHits >= 1)) {
        emit(midi);
        held = midi;
        pending = null;
        pendingHits = 0;
        dipped = false;
        peak = frame.rms;
        return;
      }
      if (pending === midi) pendingHits += 1;
      else {
        pending = midi;
        pendingHits = 1;
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
        channelCount: 1,
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
  const source = audio.createMediaStreamSource(stream);
  const compressor = audio.createDynamicsCompressor();
  compressor.threshold.value = -42;
  compressor.knee.value = 18;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.12;
  source.connect(compressor);
  compressor.connect(analyser);
  const mute = audio.createGain();
  mute.gain.value = 0;
  analyser.connect(mute);
  mute.connect(audio.destination);
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
