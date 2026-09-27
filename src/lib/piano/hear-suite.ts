import { UNITS, type Step } from "./curriculum";
import { createHearer } from "./ear";
import { analyze } from "./pitch";

const FFT = 2048;
const HOP_SECONDS = 0.02;

type Partials = number[];

type Style = {
  name: string;
  amp: number;
  noise: number;
  cents: number;
  note: number;
  gap: number;
  partials: Partials;
};

const PIANO: Partials = [1, 0.62, 0.36, 0.2, 0.12, 0.07];
const WEAK: Partials = [0.08, 1, 0.7, 0.4, 0.22];

const STYLES: Style[] = [
  { name: "clear", amp: 0.22, noise: 0.001, cents: 0, note: 0.22, gap: 0.14, partials: PIANO },
  { name: "room", amp: 0.1, noise: 0.008, cents: 16, note: 0.18, gap: 0.1, partials: PIANO },
  { name: "soft", amp: 0.045, noise: 0.003, cents: -14, note: 0.2, gap: 0.11, partials: PIANO },
  { name: "thin", amp: 0.14, noise: 0.006, cents: 8, note: 0.16, gap: 0.08, partials: WEAK },
];

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lessonNotes(step: Step): number[] {
  if (step.kind === "phrase") return step.notes;
  if (step.kind === "find") return step.accept.filter((midi) => midi >= 48 && midi <= 72);
  if (step.kind === "explore") return [60, 64, 67, 61];
  return [];
}

async function render(events: { midi: number; at: number; dur: number; amp: number; cents: number; partials: Partials }[], seconds: number, noiseAmp: number, seed: number) {
  const sr = 48000;
  const length = Math.ceil(sr * seconds);
  const offline = new OfflineAudioContext(1, length, sr);
  const master = offline.createGain();
  master.gain.value = 1;
  master.connect(offline.destination);

  const noiseBuffer = offline.createBuffer(1, length, sr);
  const noise = noiseBuffer.getChannelData(0);
  const random = mulberry32(seed);
  let pink = 0;
  for (let i = 0; i < length; i++) {
    const white = random() * 2 - 1;
    pink = pink * 0.97 + white * 0.03;
    noise[i] = pink * noiseAmp * 4;
  }
  const noiseSource = offline.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.connect(master);
  noiseSource.start();

  for (const event of events) {
    const freq = 440 * 2 ** ((event.midi - 69) / 12 + event.cents / 1200);
    let weight = 0;
    for (const partial of event.partials) weight += partial;
    event.partials.forEach((partial, index) => {
      const osc = offline.createOscillator();
      osc.type = "sine";
      const harmonic = index + 1;
      osc.frequency.value = freq * harmonic * Math.sqrt(1 + 0.00022 * harmonic * harmonic);
      const gain = offline.createGain();
      const peak = Math.max(0.0002, (event.amp * partial) / weight);
      gain.gain.setValueAtTime(0.0001, event.at);
      gain.gain.exponentialRampToValueAtTime(peak, event.at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, event.at + Math.max(0.05, event.dur));
      osc.connect(gain);
      gain.connect(master);
      osc.start(event.at);
      osc.stop(event.at + event.dur + 0.02);
    });
  }

  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

function listen(samples: Float32Array, sampleRate: number) {
  const heard: number[] = [];
  const hearer = createHearer((midi) => heard.push(midi));
  const hop = Math.round(sampleRate * HOP_SECONDS);
  for (let pos = 0; pos + FFT < samples.length; pos += hop) {
    const hit = analyze(samples.subarray(pos, pos + FFT), sampleRate);
    hearer.push({
      rms: hit.rms,
      midi: hit.pitch?.midi ?? null,
      confidence: hit.pitch?.confidence ?? 0,
    });
  }
  return heard;
}

function same(heard: number[], notes: number[]) {
  return heard.length === notes.length && heard.every((midi, index) => midi === notes[index]);
}

export async function runHearSuite(): Promise<{ ok: boolean; checked: number; failures: string[] }> {
  const failures: string[] = [];
  let checked = 0;
  let seed = 1;

  for (const unit of UNITS) {
    for (const step of unit.steps) {
      const notes = lessonNotes(step);
      if (notes.length === 0) continue;
      for (const style of STYLES) {
        checked += 1;
        const events = notes.map((midi, index) => ({
          midi,
          at: 0.08 + index * (style.note + style.gap),
          dur: style.note,
          amp: style.amp,
          cents: style.cents,
          partials: style.partials,
        }));
        const seconds = 0.3 + notes.length * (style.note + style.gap);
        const samples = await render(events, seconds, style.noise, seed++);
        const heard = listen(samples, 48000);
        if (!same(heard, notes)) {
          failures.push(`${unit.id}/${step.id} ${style.name}: want ${notes.join(" ")} got ${heard.join(" ") || "(none)"}`);
        }
      }
    }
  }

  checked += 1;
  const held = await render(
    [{ midi: 64, at: 0.08, dur: 0.9, amp: 0.16, cents: 5, partials: PIANO }],
    1.2,
    0.004,
    seed++,
  );
  const heldHeard = listen(held, 48000);
  if (heldHeard.length !== 1 || heldHeard[0] !== 64) {
    failures.push(`hold: want 64 got ${heldHeard.join(" ") || "(none)"}`);
  }

  checked += 1;
  const room = await render([], 0.8, 0.01, seed++);
  const roomHeard = listen(room, 48000);
  if (roomHeard.length !== 0) {
    failures.push(`noise only: heard ${roomHeard.join(" ")}`);
  }

  return { ok: failures.length === 0, checked, failures };
}
