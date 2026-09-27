# Next Note — instructions for Claude

Follow `AGENTS.project.md` and `GROK.md`. Same rules either way.

Next Note teaches piano one note at a time, on a real piano (microphone) or on the on-screen keys. `judgeNote` in `src/lib/piano/curriculum.ts` is the only pass/fail rule. Yellow is the note to play. Blue means it was right. There is no correct-note chime. Do not add moving status text or Continue buttons. Stay monophonic, and keep every note inside MIDI 48–79.

After any change to lessons, pitch, the hearer, grading, or on-screen sound, run:

```bash
node scripts/hear-suite.mjs
```

The dev server must already be on port 8080. The suite must pass. It plays every lesson through the browser audio engine, in a noisy room as well as a quiet one, and checks both pianos. `npm run typecheck` must pass too.

`README.md` is the implementation map. Do not mention other piano apps by name.
