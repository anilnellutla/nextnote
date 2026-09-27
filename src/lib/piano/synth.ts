let ctx: AudioContext | null = null;
let speaker: HTMLAudioElement | null = null;
let speakerUrl = "";

function context(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    try {
      ctx = new AC();
    } catch {
      ctx = new (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext();
    }
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

function tone(audio: AudioContext, midi: number, when: number, duration: number): void {
  const t = audio.currentTime + Math.max(0, when);
  const freq = midiToFreq(midi);
  const master = audio.createGain();
  master.gain.value = 0.32;
  master.connect(audio.destination);

  const fundamental = audio.createOscillator();
  fundamental.type = "triangle";
  fundamental.frequency.value = freq;
  fundamental.connect(master);

  const overtone = audio.createOscillator();
  overtone.type = "sine";
  overtone.frequency.value = freq * 2;
  const overtoneGain = audio.createGain();
  overtoneGain.gain.value = 0.12;
  overtone.connect(overtoneGain);
  overtoneGain.connect(master);

  fundamental.start(t);
  overtone.start(t);
  fundamental.stop(t + duration);
  overtone.stop(t + duration);
}

/** Safari will not keep playing a blob once its URL is revoked, so the element stays. */
function beep(midi: number): void {
  const freq = midiToFreq(midi);
  const sr = 22050;
  const n = Math.floor(sr * 0.5);
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
    const env = Math.min(1, i / 200) * (1 - i / n);
    const sample = Math.sin((2 * Math.PI * freq * i) / sr) * env * 0.95;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  if (!speaker) {
    speaker = document.createElement("audio");
    speaker.setAttribute("playsinline", "true");
    speaker.style.display = "none";
    document.body.appendChild(speaker);
  }
  if (speakerUrl) URL.revokeObjectURL(speakerUrl);
  speakerUrl = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  speaker.src = speakerUrl;
  speaker.volume = 1;
  const pending = speaker.play();
  if (pending) void pending.catch(() => undefined);
}

/** Call from the click itself. Safari ignores a note started while sound is still locked. */
export function playNote(midi: number, when = 0, duration = 0.7): void {
  let audio: AudioContext;
  try {
    audio = context();
  } catch {
    beep(midi);
    return;
  }
  const start = () => {
    try {
      tone(audio, midi, when, duration);
    } catch {
      beep(midi);
    }
  };
  if (audio.state === "running") {
    start();
    return;
  }
  // Safari leaves the context suspended until resume() finishes, and drops
  // any oscillator started before that. The wav plays in this click instead.
  void audio.resume();
  beep(midi);
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
