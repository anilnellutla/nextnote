# Next Note

A browser piano tutor for a beginner. Lessons advance one note at a time. The child can play a real piano into the microphone, or tap the keys on the screen. Both paths use the same lessons and the same pass/fail rule.

This is a first-year start, not a complete method. It teaches keyboard geography, a five-finger hand, a few songs, one black key, a C scale, and hands answering each other. It hears one pitch at a time. It does not grade chords, rhythm length, dynamics, or posture.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:8080.

`npm run typecheck` runs the TypeScript check. `npm run test:hear` runs the listening suite. The suite needs the dev server already up, because it drives the app in headless Chromium and imports the suite from that page. Override the URL with `HEAR_SUITE_URL` if the server is not on port 8080.

## Two pianos

**Our piano** asks for the microphone, with echo cancellation, noise suppression, and auto gain turned off so the raw string sound reaches the detector. A short mic check must hear a real note before lessons start. The phone or tablet sits on the music stand, screen toward the bench.

**On the screen** uses the same lesson, but a tap is the note. Taps call `playNote` from the click or touch that Safari counts as a real gesture. The first tap may be a plain tone while Safari unlocks audio. After that, each key is a short triangle wave plus a quiet octave overtone. There is no extra chime for a correct note. The key turning blue is the “yes.”

Tapping the picture while the microphone is the thing being graded plays the tone but does not mark the lesson, and the microphone ignores the speaker for a moment so the speaker cannot pass the step.

## What the child sees

The yellow key is the note to play now. Blue means that note was already right. Grey is a different pitch than the one the lesson wanted. A note ribbon shows the same idea for a song: yellow is now, blue is done. Finger numbers sit on the keys. Lyrics sit under song steps. Talk steps move on by themselves. A find step waits for one pitch. A phrase step waits through the melody and does not move on a wrong note. Any lesson on the list can be opened. Progress, stars, points, and the chosen piano are stored in `localStorage` under `next-note-v1`. Reset is in the header.

Points are awarded for notes and finished steps. Ranks run from First note to Concert kid. Stars are 3, 2, or 1 from how many wrong notes happened on that step.

## Lessons

Units live in `src/lib/piano/curriculum.ts`. A step is a `talk`, an `explore` (any key, then move on), a `find` (one accepted pitch, including “any C”), or a `phrase` (a list of MIDI notes, optional lyrics and finger numbers). The keyboard covers C3 through G5, MIDI 48–79.

| Month | Units |
|---|---|
| 1 | Piano map, right hand, Hot Cross Buns, Mary Had a Little Lamb, Yankee Doodle, left hand, hands taking turns, a short recital |
| 2 | Steps and skips, Ode to Joy, Are You Sleeping, Hot Cross Buns in the left hand |
| 3 | Twinkle, Twinkle, London Bridge, F♯ |
| 4 | C scale, Joy to the World, Jingle Bells, the left hand answering the right |
| 5 | Ode to Joy, Twinkle, and Jingle Bells played for someone |

`judgeNote` is the only pass/fail rule. The lesson screen and the test suite both call it, so a wrong key is rejected the same way in both places.

## Listening

`src/lib/piano/pitch.ts` estimates one pitch with YIN (difference function, cumulative mean normalized difference, parabolic interpolation), then snaps to the nearest semitone. A weak fundamental can be checked with a Goertzel magnitude so a loud octave overtone is not reported as the note. Frames that are too quiet return no pitch.

`src/lib/piano/ear.ts` polls an `AnalyserNode` (FFT size 2048) about every 20 ms and feeds `createHearer`. The hearer ignores the noise floor, waits a couple of agreeing frames before it believes a new pitch, and uses a dip in loudness to hear the same note played twice. A jump of one or two octaves has to agree for longer, so a noisy octave ghost does not count, while a real jump such as middle C down to low C still does. Accepted notes are roughly MIDI 36–84. The microphone graph is compressed slightly, then pulled through a silent gain into the speakers so the analyser keeps receiving samples. The microphone sound is not played back.

## Tests

`npm run test:hear` plays every lesson note through `OfflineAudioContext` and listens with the same `analyze` and `createHearer` the microphone uses. It does this for every graded step, in six conditions:

- our piano, clear
- our piano in room noise, a bit sharp
- our piano, played softly
- our piano with a weak fundamental
- the on-screen tone
- the on-screen tone in room noise

It also holds one note and expects a single detection, plays noise alone and expects silence, and walks every lesson on the screen: a wrong key must not advance, and the right keys must finish the step. Lyrics have to match the note count, and every note has to sit on the on-screen keyboard.

Run that suite after a change to lessons, pitch detection, or the hearer.

## Layout

```
src/components/piano/studio.tsx    lesson flow, both pianos, points
src/components/piano/keyboard.tsx  labeled keys
src/components/piano/staff.tsx     treble or bass, current note in yellow
src/lib/piano/curriculum.ts        units, steps, judgeNote
src/lib/piano/theory.ts            names, range, coaching text
src/lib/piano/pitch.ts             YIN
src/lib/piano/ear.ts               microphone and the hearer
src/lib/piano/synth.ts             on-screen sound
src/lib/piano/store.ts             progress in localStorage
src/lib/piano/hear-suite.ts        the listening checks
scripts/hear-suite.mjs             runs those checks in Chromium
```

The app is a Vite + React client. Lessons do not use an account. The scaffold’s auth and database pieces are unused by the tutor.
