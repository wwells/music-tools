# Music Tools v1 Specification

## Overview

A static site for music tools hosted on GitHub Pages. Phase 1 focuses on a landing page and an interactive frequency table tool.

## Tech Stack

- **HTML/CSS/JS** - No build step, just static files
- **Pico CSS** - Minimal classless CSS framework (~10kb) with built-in dark/light mode via `prefers-color-scheme`
- **Web Audio API** - For playing frequency tones

## Project Structure

```
music_tools/
├── index.html              # Landing page
├── tools/
│   └── frequency-table/
│       ├── index.html      # Frequency table tool
│       ├── style.css       # Tool-specific styles
│       └── script.js       # Audio + interactivity
├── css/
│   └── main.css            # Shared custom styles
├── specs/
│   └── v1-frequency-table.md   # This spec document
└── README.md               # Local dev instructions
```

## Landing Page Requirements

- Simple header with site name
- Brief description of what the site offers
- List/grid of available tools (frequency table for now)
- Clean, minimal design leveraging Pico CSS defaults
- Responsive layout

## Frequency Table Tool Requirements

### Display
- Interactive table showing all 12 notes (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- Octaves 0 through 8 as columns
- Frequency values in Hertz (Hz)
- Reference note A4 = 440 Hz visually highlighted
- Mobile-friendly with horizontal scroll for table

### Interaction
- Clickable cells that play the corresponding frequency as a tone
- Visual feedback on click (highlight/animation)

### Audio Implementation
- Use Web Audio API `OscillatorNode` to generate sine wave tones
- Tone duration: ~500ms
- Fade-out envelope to avoid audio clicks
- No external audio dependencies

## Frequency Reference

Based on equal-tempered scale with A4 = 440 Hz:

| Note | Octave 4 (Hz) |
|------|---------------|
| C    | 261.63        |
| C#   | 277.18        |
| D    | 293.66        |
| D#   | 311.13        |
| E    | 329.63        |
| F    | 349.23        |
| F#   | 369.99        |
| G    | 392.00        |
| G#   | 415.30        |
| A    | 440.00        |
| A#   | 466.16        |
| B    | 493.88        |

Formula: `f = 440 * 2^((n-69)/12)` where n is MIDI note number (A4 = 69)

## Future Considerations (Phase 2)

- Realistic piano samples using Tone.js or custom audio files
- Toggle between "pure tone" and "piano" sound
- Additional tools (scales, chords, intervals, etc.)
