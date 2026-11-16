# How it's made

A lyric video here has one job: let someone who does not speak the song's language follow it word by word, without the song being changed to make that easier. The recording is the artist's and stays as it is. Everything added sits beside it.

There are three stages, with a check after the last one.

## 1. Translation

The translation is for meaning, not for singing. It does not rhyme and it does not try to fit the melody.

- Each line is translated whole first, so the sense is right before any word is matched to another.
- Then every translated word is linked to the original word or words it renders. English often needs more words than Russian, and in a different order. A link can join one word to several, and the order is allowed to differ.
- What the song leaves unsaid stays unsaid. If the original does not name who is being addressed, the translation does not guess.
- There are no pronunciation guides or sing-along respellings by default. The second language is there to be read.

## 2. Timing

Every sung word gets its own start and end, measured against the original recording.

- Speech alignment tools propose the first set of times. A separated vocal track helps them hear quiet entrances; it is used for analysis only and never replaces the recording.
- The proposals are then reviewed against the actual audio. Quiet first syllables, long held vowels and repeated lines are the usual places where a tool is confidently wrong, so each of those is checked on its own. A chorus that returns three times is timed three times.
- Times are stored against the audio's own clock and turned into video frames only at the end. That keeps a word from drifting when the frame rate or the format changes.
- The translation has no times of its own. A translated word lights when the original word it is linked to is sung.

## 3. Picture and render

Both languages are set at the same size, weight and contrast. The translation is not a subtitle under the real lyrics.

- By default the sung word changes colour and nothing else. No bouncing text, no underline sweeping along the line.
- The picture is the release's own artwork or video, kept whole, or a picture made for that song: usually an animation drawn in code, in a few early videos AI-assisted artwork.
- Anything that moves with the music is driven by measurements of the recording, such as the energy in a set of frequency bands, and is placed inside the picture: light in a painted window, a contour along an edge that is already there.
- Most videos are composed twice, once for 16:9 and once for 9:16, and rendered at 1080p and 60 frames a second. The scenes are code: TypeScript, with React and Remotion for most compositions and FFmpeg for the encode. The original recording is the soundtrack.

## 4. Checking the result

A complete preview comes before the final render. After the render, the finished file is checked, not the project that made it: it has to decode from start to end, every frame has to land on its time, the audio has to match the source, and the highlighted words in the encoded picture have to be the ones that should be lit at that moment.

## What is assisted and what is not

Translation, word timing, the animation code and the upload text are made with AI assistance. A person chooses the songs, directs the look, reviews the result and publishes it. The music, lyrics, performances and source artwork are not generated and are not altered, apart from the few editions marked in the catalog as a vocal mix, where the balance between voice and instruments was changed on purpose.

## What is not here

This repository describes the method and lists the results. The working files stay private: lyrics and translations, audio, artwork and the rendered videos all belong to someone, and publishing them is not the same as linking to them.
