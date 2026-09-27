# Next Note — instructions for Grok

Follow `AGENTS.project.md`. It is the project contract: one note at a time, yellow means play this, blue means correct, no chime, no extra buttons, monophonic lessons only, notes inside MIDI 48–79, and `judgeNote` as the only pass/fail rule.

After any change to lessons, pitch detection, the hearer, grading, or on-screen sound, run `node scripts/hear-suite.mjs` with the dev server already on port 8080. It must pass. The suite plays every lesson through the browser audio engine, including a noisy room, and checks both the real-piano listener and the on-screen keys.

`README.md` explains the implementation. Do not mention other piano apps by name.
