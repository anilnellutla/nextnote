import { staffSteps } from "@/lib/piano/theory";

export function Staff({
  notes,
  index,
  clef,
}: {
  notes: number[];
  index: number;
  clef: "treble" | "bass";
}) {
  const space = 8;
  const bottom = 70;
  const leftPad = 18;
  const stepX = 34;
  const width = Math.max(168, leftPad + notes.length * stepX + 12);
  const height = 100;
  const lineYs = [0, 1, 2, 3, 4].map((line) => bottom - line * space);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-24 w-full" role="img" aria-label={clef === "treble" ? "Treble staff" : "Bass staff"}>
      <text x={4} y={14} fill="var(--color-muted)" fontSize={11} fontWeight={700}>
        {clef === "treble" ? "treble" : "bass"}
      </text>
      {lineYs.map((y) => (
        <line key={y} x1={8} x2={width - 8} y1={y} y2={y} stroke="var(--color-line)" strokeWidth={1} />
      ))}
      {notes.map((midi, noteIndex) => {
        const steps = staffSteps(midi, clef);
        const cx = leftPad + noteIndex * stepX + 8;
        const cy = bottom - steps * (space / 2);
        const active = noteIndex === index;
        const past = noteIndex < index;
        const ledgers: number[] = [];
        if (steps <= -2) {
          for (let s = -2; s >= steps; s -= 2) ledgers.push(bottom - s * (space / 2));
        }
        if (steps >= 10) {
          for (let s = 10; s <= steps; s += 2) ledgers.push(bottom - s * (space / 2));
        }
        const fill = active ? "var(--color-amber)" : past ? "var(--color-ink)" : "var(--color-ivory)";
        return (
          <g key={`${midi}-${noteIndex}`}>
            {ledgers.map((y) => (
              <line key={y} x1={cx - 10} x2={cx + 10} y1={y} y2={y} stroke="var(--color-ink)" strokeWidth={1} />
            ))}
            <ellipse cx={cx} cy={cy} rx={6.5} ry={4.6} fill={fill} stroke="var(--color-ink)" strokeWidth={1.6} />
            <line x1={cx + 5.5} y1={cy} x2={cx + 5.5} y2={cy - 24} stroke="var(--color-ink)" strokeWidth={1.6} />
          </g>
        );
      })}
    </svg>
  );
}
