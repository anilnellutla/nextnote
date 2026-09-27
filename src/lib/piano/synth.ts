let ctx: AudioContext | null = null;

function context(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

export function resumeSynth(): void {
  const audio = context();
  if (audio.state !== "running") void audio.resume();
}

function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Must be called from the tap or keydown that should be heard. */
export function playNote(midi: number, when = 0, duration = 0.55): void {
  const audio = context();
  if (audio.state !== "running") void audio.resume();
  const t = audio.currentTime + when;
  const freq = midiToFreq(midi);
  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.32, t + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  master.connect(audio.destination);

  const fundamental = audio.createOscillator();
  fundamental.type = "triangle";
  fundamental.frequency.setValueAtTime(freq, t);
  const overtone = audio.createOscillator();
  overtone.type = "sine";
  overtone.frequency.setValueAtTime(freq * 2, t);
  const overtoneGain = audio.createGain();
  overtoneGain.gain.value = 0.22;
  fundamental.connect(master);
  overtone.connect(overtoneGain);
  overtoneGain.connect(master);
  fundamental.start(t);
  overtone.start(t);
  fundamental.stop(t + duration + 0.05);
  overtone.stop(t + duration + 0.05);
}

export function playYes(): void {
  const audio = context();
  if (audio.state !== "running") void audio.resume();
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(1318, t + 0.12);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.24);
}
export async function playSequence(
  notes: number[],
  onEach: (midi: number, index: number) => void,
): Promise<void> {
  resumeSynth();
  const gap = notes.length > 12 ? 480 : 640;
  for (let i = 0; i < notes.length; i++) {
    onEach(notes[i], i);
    playNote(notes[i], 0, 0.5);
    await new Promise((resolve) => setTimeout(resolve, gap));
  }
}
