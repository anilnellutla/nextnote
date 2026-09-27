let ctx: AudioContext | null = null;
const queue: Array<() => void> = [];

function context(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

function flush(): void {
  const audio = ctx;
  if (!audio || audio.state !== "running") return;
  const jobs = queue.splice(0, queue.length);
  for (const job of jobs) {
    try {
      job();
    } catch {
      // A rejected ramp must not silence the rest of the note.
    }
  }
}

export function resumeSynth(): void {
  const audio = context();
  if (audio.state === "running") {
    flush();
    return;
  }
  try {
    const buffer = audio.createBuffer(1, 1, audio.sampleRate || 22050);
    const tap = audio.createBufferSource();
    tap.buffer = buffer;
    tap.connect(audio.destination);
    tap.start(0);
  } catch {
    // Unlocking is best-effort. The queued note still plays after resume.
  }
  void audio.resume().then(flush);
}

function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function tone(midi: number, when: number, duration: number): void {
  const audio = context();
  const t = audio.currentTime + Math.max(0, when);
  const freq = midiToFreq(midi);
  const master = audio.createGain();
  master.gain.setValueAtTime(0.3, t);
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
  overtoneGain.gain.setValueAtTime(0.12, t);
  overtone.connect(overtoneGain);
  overtoneGain.connect(master);

  fundamental.start(t);
  overtone.start(t);
  fundamental.stop(t + duration + 0.02);
  overtone.stop(t + duration + 0.02);
}

/** Must be called from the tap or keydown that should be heard. */
export function playNote(midi: number, when = 0, duration = 0.7): void {
  queue.push(() => tone(midi, when, duration));
  resumeSynth();
}

export function playYes(): void {
  queue.push(() => {
    const audio = context();
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.linearRampToValueAtTime(1318, t + 0.12);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  });
  resumeSynth();
}

export async function playSequence(
  notes: number[],
  onEach: (midi: number, index: number) => void,
): Promise<void> {
  const audio = context();
  if (audio.state !== "running") await audio.resume();
  flush();
  const gap = notes.length > 12 ? 480 : 640;
  for (let i = 0; i < notes.length; i++) {
    onEach(notes[i], i);
    playNote(notes[i], 0, 0.5);
    await new Promise((resolve) => setTimeout(resolve, gap));
  }
}
