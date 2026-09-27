export type PitchHit = {
  frequency: number;
  midi: number;
  confidence: number;
};

export type Analysis = {
  rms: number;
  pitch: PitchHit | null;
};

/** Monophonic pitch for a single piano note. YIN, then nearest semitone. */
export function analyze(samples: Float32Array, sampleRate: number): Analysis {
  const n = samples.length;
  let energy = 0;
  for (let i = 0; i < n; i++) energy += samples[i] * samples[i];
  const rms = Math.sqrt(energy / Math.max(1, n));
  if (n < 256 || rms < 0.012) return { rms, pitch: null };

  const step = n >= 1024 ? 2 : 1;
  const sr = sampleRate / step;
  const m = Math.floor(n / step);
  const x = new Float32Array(m);
  for (let i = 0; i < m; i++) x[i] = samples[i * step];

  const tauMin = Math.max(2, Math.floor(sr / 1500));
  const tauMax = Math.min(m - 2, Math.floor(sr / 65));
  if (tauMax <= tauMin + 2) return { rms, pitch: null };
  const window = m - tauMax;

  const diff = new Float64Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let j = 0; j < window; j++) {
      const d = x[j] - x[j + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }

  const cmnd = new Float64Array(tauMax + 1);
  cmnd[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += diff[tau];
    cmnd[tau] = running > 0 ? (diff[tau] * tau) / running : 1;
  }

  const threshold = 0.15;
  let tauEstimate = -1;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (cmnd[tau] < threshold) {
      while (tau + 1 <= tauMax && cmnd[tau + 1] < cmnd[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }
  if (tauEstimate < 0) {
    let best = tauMin;
    for (let tau = tauMin + 1; tau <= tauMax; tau++) {
      if (cmnd[tau] < cmnd[best]) best = tau;
    }
    if (cmnd[best] > 0.35) return { rms, pitch: null };
    tauEstimate = best;
  }

  const t = tauEstimate;
  const x0 = cmnd[t - 1] ?? cmnd[t];
  const x1 = cmnd[t];
  const x2 = cmnd[t + 1] ?? cmnd[t];
  const curve = x0 - 2 * x1 + x2;
  const betterTau = curve !== 0 ? t + (x0 - x2) / (2 * curve) : t;
  if (!(betterTau > 1)) return { rms, pitch: null };

  const frequency = sr / betterTau;
  if (frequency < 60 || frequency > 1600) return { rms, pitch: null };

  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(midiFloat);
  const nearest = 440 * 2 ** ((midi - 69) / 12);
  const cents = Math.abs(1200 * Math.log2(frequency / nearest));
  if (cents > 50) return { rms, pitch: null };

  return {
    rms,
    pitch: {
      frequency,
      midi,
      confidence: Math.max(0, 1 - x1),
    },
  };
}
