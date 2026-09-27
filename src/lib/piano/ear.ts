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
    throw new Error("The browser didn't share the microphone.");
  }

  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  audio = new AC();
  await audio.resume();
  const analyser = audio.createAnalyser();
  analyser.fftSize = 2048;
  audio.createMediaStreamSource(stream).connect(analyser);
  const buffer = new Float32Array(analyser.fftSize);
  running = true;

  let pending: number | null = null;
  let count = 0;
  let lastEmit = 0;
  let lastMidi = -1;

  timer = window.setInterval(() => {
    if (!running || !audio) return;
    analyser.getFloatTimeDomainData(buffer);
    const hit = analyze(buffer, audio.sampleRate);
    const midi = hit.pitch?.midi ?? null;
    for (const handler of levelHandlers) handler({ rms: hit.rms, midi });
    if (midi == null) {
      pending = null;
      count = 0;
      return;
    }
    if (midi === pending) count += 1;
    else {
      pending = midi;
      count = 1;
    }
    if (count < 3) return;
    const now = performance.now();
    if (midi === lastMidi && now - lastEmit < 420) return;
    if (now - lastEmit < 160) return;
    lastEmit = now;
    lastMidi = midi;
    count = 0;
    for (const handler of noteHandlers) handler(midi);
  }, 48);
}
