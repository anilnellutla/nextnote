# Next Note

After any change to the piano lesson app, run the listening suite before you finish:

`node scripts/hear-suite.mjs`

The dev server must already be on port 8080. The suite plays every lesson through the browser audio engine, including a noisy room, a soft note, and a thin piano tone, then checks the same pitch code the microphone uses. It must pass.
