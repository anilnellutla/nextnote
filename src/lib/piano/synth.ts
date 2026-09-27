let ctx: AudioContext | null = null;

function context(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: "interactive" });
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

function tone(midi: number, when: number, duration: number): void {
  const audio = context();
  const t = audio.currentTime + Math.max(0, when);
  const freq = midiToFreq(midi);
  const master = audio.createGain();
  master.gain.setValueAtTime(0.35, t);
  master.gain.linearRampToValueAtTime(0.001, t + duration);
  master.connect(audio.destination);

  const fundamental = audio.createOscillator();
  fundamental.type = "triangle";
  fundamental.frequency.setValueAtTime(freq, t);
  fundamental.connect(master);

  const overtone = audio.createOscillator();
  overtone.type = "sine";
  overtone.frequency.setValueAtTime(freq * 2, t);
  const overtoneGain = audio.createGain();
  overtoneGain.gain.setValueAtTime(0.14, t);
  overtone.connect(overtoneGain);
  overtoneGain.connect(master);

  fundamental.start(t);
  overtone.start(t);
  fundamental.stop(t + duration + 0.02);
  overtone.stop(t + duration + 0.02);
}

function beep(midi: number): void {
  const freq = midiToFreq(midi);
  const sr = 22050;
  const n = Math.floor(sr * 0.45);
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, i / 180) * (1 - i / n);
    const sample = Math.sin((2 * Math.PI * freq * i) / sr) * env * 0.9;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  const url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  const player = new Audio(url);
  player.volume = 1;
  void player.play().finally(() => URL.revokeObjectURL(url));
}

/** Must be called from the tap itself, not from a timer. */
export function playNote(midi: number, when = 0, duration = 0.7): void {
  const audio = context();
  if (audio.state !== "running") void audio.resume();
  try {
    tone(midi, when, duration);
  } catch {
    beep(midi);
    return;
  }
  if (audio.state !== "running") beep(midi);
}

export function playYes(): void {
  const audio = context();
  if (audio.state !== "running") void audio.resume();
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.linearRampToValueAtTime(1318, t + 0.12);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.linearRampToValueAtTime(0.001, t + 0.14);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

export async function playSequence(
  notes: number[],
  onEach: (midi: number, index: number) => void,
): Promise<void> {
  const audio = context();
  if (audio.state !== "running") await audio.resume();
  const gap = notes.length > 12 ? 480 : 640;
  for (let i = 0; i < notes.length; i++) {
    onEach(notes[i], i);
    playNote(notes[i], 0, 0.5);
    await new Promise((resolve) => setTimeout(resolve, gap));
  }
}
