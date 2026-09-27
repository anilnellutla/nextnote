import { useRef } from "react";
import { isBlack, kidName, letterOf, octaveOf, pitchClass, rangeMidis } from "@/lib/piano/theory";
import { playNote } from "@/lib/piano/synth";

const MIDIS = rangeMidis();
const WHITES = MIDIS.filter((midi) => !isBlack(midi));
const BLACKS = MIDIS.filter((midi) => isBlack(midi));
const WHITE_INDEX = new Map(WHITES.map((midi, index) => [midi, index]));

type Props = {
  fingers?: Record<number, string>;
  position?: number[];
  targets: number[];
  heard?: number | null;
  flash: number | null;
  interactive: boolean;
  onPlay: (midi: number) => void;
};

export function Keyboard({ fingers, position, targets, heard, flash, interactive, onPlay }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-walnut p-3 pb-4 piano-scroll">
      <div className="piano-keys">
        {WHITES.map((midi) => (
          <Key
            key={midi}
            midi={midi}
            black={false}
            finger={fingers?.[midi]}
            hot={position?.includes(midi) ?? false}
            heard={midi === heard}
            target={targets.includes(midi)}
            flash={midi === flash}
            interactive={interactive}
            onPlay={onPlay}
          />
        ))}
        {BLACKS.map((midi) => (
          <Key
            key={midi}
            midi={midi}
            black
            finger={fingers?.[midi]}
            hot={position?.includes(midi) ?? false}
            heard={midi === heard}
            target={targets.includes(midi)}
            flash={midi === flash}
            interactive={interactive}
            onPlay={onPlay}
            left={`calc((${WHITE_INDEX.get(midi - 1) ?? 0} + 1) * var(--white) - (var(--black) / 2))`}
          />
        ))}
      </div>
    </div>
  );
}

function Key({
  midi,
  black,
  finger,
  hot,
  heard,
  target,
  flash,
  interactive,
  onPlay,
  left,
}: {
  midi: number;
  black: boolean;
  finger?: string;
  hot: boolean;
  heard: boolean;
  target: boolean;
  flash: boolean;
  interactive: boolean;
  onPlay: (midi: number) => void;
  left?: string;
}) {
  const last = useRef(0);
  function press() {
    if (!interactive) return;
    const now = performance.now();
    if (now - last.current < 350) return;
    last.current = now;
    playNote(midi);
    onPlay(midi);
  }
  const tone = flash
    ? "key-yes"
    : target
      ? "key-target"
      : heard
        ? "key-heard"
        : black
          ? "bg-ink text-ivory"
          : hot
            ? "bg-ivory text-ink ring-2 ring-amber ring-inset"
            : "bg-ivory text-ink";

  return (
    <button
      type="button"
      data-midi={midi}
      disabled={!interactive}
      style={left ? { left } : undefined}
      onTouchEnd={(event) => {
        if (!interactive) return;
        event.preventDefault();
        press();
      }}
      onClick={press}
      className={
        "flex items-end justify-center rounded-b-md pb-1.5 font-extrabold " +
        (black ? "black-key " : "white-key ") +
        tone +
        (interactive ? " active:translate-y-px" : " cursor-default")
      }
      aria-label={kidName(midi)}
    >
      <span className="key-face">
        {finger ? <span className="key-finger">{finger}</span> : null}
        <span className="key-name">{keyName(midi)}</span>
        {octaveTag(midi) ? <span className="key-oct">{octaveTag(midi)}</span> : null}
      </span>
    </button>
  );
}

function keyName(midi: number): string {
  return letterOf(midi).replace("#", "♯");
}

function octaveTag(midi: number): string | null {
  if (pitchClass(midi) !== 0) return null;
  if (midi === 60) return "mid";
  if (octaveOf(midi) <= 3) return "low";
  if (octaveOf(midi) >= 5) return "high";
  return null;
}

export function BlackKeyGuide({ group }: { group: "two" | "three" | "both" }) {
  if (group === "both") {
    return (
      <div className="mt-3 flex flex-wrap gap-4">
        <GuideShape group="two" />
        <GuideShape group="three" />
      </div>
    );
  }
  return (
    <div className="mt-3">
      <GuideShape group={group} />
    </div>
  );
}

function GuideShape({ group }: { group: "two" | "three" }) {
  const whites = group === "two" ? ["C", "D", "E"] : ["F", "G", "A", "B"];
  const blacks = group === "two" ? [0, 1] : [0, 1, 2];
  const sharpNames = group === "two" ? ["C♯", "D♯"] : ["F♯", "G♯", "A♯"];
  return (
    <div className="inline-flex flex-col gap-1">
      <div className="guide-keys">
        {whites.map((name) => (
          <div key={name} className="mini-white">
            <span className={name === "C" || name === "F" ? "text-felt" : "text-muted"}>{name}</span>
          </div>
        ))}
        {blacks.map((index) => (
          <div
            key={index}
            className="mini-black"
            style={{ left: `calc((${index} + 1) * var(--mini-white) - (var(--mini-black) / 2))` }}
          >
            {sharpNames[index]}
          </div>
        ))}
      </div>
      <p className="text-xs font-bold text-muted">{group === "two" ? "Two black keys" : "Three black keys"}</p>
    </div>
  );
}
