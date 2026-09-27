# Next Note — project instructions

Next Note is a browser piano tutor for a beginner. One note at a time. A real piano through the microphone, or the keys on the screen. Both use the same lessons and the same pass/fail rule, `judgeNote` in `src/lib/piano/curriculum.ts`.

Read `README.md` for the map of the code. These are the rules that must not drift.

## Product

- The child is 9. Keep the screen quiet. Do not add a sentence that changes on every note. A pulsing mic icon is enough to show listening. Do not add Continue, Next, or “show the yellow key” buttons. The yellow key is the hint, shown immediately. Talk steps move on by themselves. A finished phrase moves on by itself.
- Yellow is the note to play now. Blue means that note was right. Grey is a different pitch. There is no “yes” chime. The piano, or the on-screen tone, is the only sound.
- Lessons stay monophonic. Do not add chords or two notes at once. The listener cannot grade them.
- Every lesson note must sit on the on-screen keyboard, MIDI 48–79 (C3 through G5).
- Any lesson can be opened. Reset stays in the header. Progress stays in `localStorage` under `next-note-v1`.
- Do not mention other piano apps by name anywhere in the product, the copy, or the repo.
- Auth and the database stay off. Lessons do not use an account.

## Listening and sound

- Pitch detection is `analyze` in `src/lib/piano/pitch.ts` (YIN, then nearest semitone, with a Goertzel check when the fundamental is weak). Note onsets are `createHearer` in `src/lib/piano/ear.ts`. The microphone path and the test suite must keep calling those, not a second detector.
- A new pitch needs a couple of agreeing frames. A jump of one or two octaves needs longer, so a noisy octave ghost does not count, but a real jump (middle C to low C) still does. A dip in loudness is how a repeated note counts twice.
- On-screen sound must start inside the click or touch the browser treats as a gesture. Safari drops a note scheduled while the audio context is still suspended. Do not `preventDefault` on the key press before the note is played. The first tap may be a plain tone while audio unlocks. After that, each key is the short triangle tone.
- A tap on the picture while the microphone is grading must not mark the lesson, and the microphone must ignore the speaker for a moment.

## After every change

Run the listening suite before you finish, and after every change to lessons, pitch, the hearer, grading, or on-screen sound:

```bash
node scripts/hear-suite.mjs
```

The dev server must already be on port 8080. The suite plays every lesson note through the browser audio engine and listens with the same pitch code the microphone uses. It covers our piano (clear, noisy room, soft, thin fundamental) and the on-screen tone (clean and noisy). It also walks every lesson as on-screen key presses: a wrong key must not advance, and the right keys must finish the step. It must pass. `npm run typecheck` must pass too.

## Do not touch

Do not replace the sandbox `AGENTS.md` (it is gitignored and is the app-builder contract). Do not remove `startup.sh`, `PreviewHostBridge`, or the Grok branding injector.
