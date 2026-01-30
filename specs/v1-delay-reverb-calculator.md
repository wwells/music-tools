# Delay & Reverb Calculator Specification

## Overview

A delay and reverb time calculator tool that computes timing values synchronized to a song's tempo (BPM). This helps producers set precise delay times, pre-delay, and decay settings that groove with their music.

## Tech Stack

- **HTML/CSS/JS** - No build step, just static files
- **Pico CSS** - Minimal classless CSS framework with built-in dark/light mode
- **No audio required** - Pure calculation tool

## Project Structure

```
music_tools/
├── tools/
│   └── delay-reverb/
│       ├── index.html      # Delay/reverb calculator tool
│       ├── style.css       # Tool-specific styles
│       └── script.js       # Calculation logic + interactivity
├── specs/
│   └── v2-delay-reverb-calculator.md   # This spec document
```

## Tool Requirements

### BPM Input

- Numeric input field for BPM
- Range: 20-300 BPM
- Default value: 120 BPM
- Real-time calculation updates as user changes value
- Clear labeling and instructions

### Reverb Settings Table

Display recommended pre-delay and decay times for common room sizes:

| Room Size | Note Value | Pre-Delay | Decay Time | Total Time |
|-----------|------------|-----------|------------|------------|
| Hall | 2 Bars | 1/64 note | Remainder | 2 bars |
| Large Room | 1 Bar | 1/64 note | Remainder | 1 bar |
| Small Room | 1/2 Note | 1/128 note | Remainder | 1/2 note |
| Tight Ambience | 1/4 Note | 1/256 note | Remainder | 1/4 note |

Pre-delay is typically a very short subdivision (1/64 to 1/256), with decay time filling the remainder of the total reverb time.

### Delay Times Table

Show delay lengths for various note values with three variants:

| Note Value | Normal | Dotted | Triplet |
|------------|--------|--------|---------|
| 1/1 (Whole) | ms / Hz | ms / Hz | ms / Hz |
| 1/2 (Half) | ms / Hz | ms / Hz | ms / Hz |
| 1/4 (Quarter) | ms / Hz | ms / Hz | ms / Hz |
| 1/8 | ms / Hz | ms / Hz | ms / Hz |
| 1/16 | ms / Hz | ms / Hz | ms / Hz |
| 1/32 | ms / Hz | ms / Hz | ms / Hz |
| 1/64 | ms / Hz | ms / Hz | ms / Hz |
| 1/128 | ms / Hz | ms / Hz | ms / Hz |

Each cell displays both milliseconds and Hz (for LFO sync purposes).

### Display Features

- Values formatted to 2 decimal places for precision
- Hz values useful for syncing LFOs to tempo
- Mobile-friendly with horizontal scroll for tables
- Clear section headings explaining each table's purpose

## Formulas

### Base Delay Calculation

Quarter note (1 beat) in milliseconds:
```
quarterNoteMs = 60000 / BPM
```

### Note Value Multipliers

| Note Value | Multiplier (relative to quarter note) |
|------------|---------------------------------------|
| 1/1 (Whole) | 4 |
| 1/2 (Half) | 2 |
| 1/4 (Quarter) | 1 |
| 1/8 | 0.5 |
| 1/16 | 0.25 |
| 1/32 | 0.125 |
| 1/64 | 0.0625 |
| 1/128 | 0.03125 |
| 1/256 | 0.015625 |

### Dotted and Triplet Calculations

```
dottedMs = normalMs × 1.5
tripletMs = normalMs × (2/3)
```

### Hz Conversion

```
hz = 1000 / ms
```

## UI/UX Requirements

- Consistent header/footer matching other tools
- Navigation back to main Music Tools page
- Clean layout leveraging Pico CSS defaults
- Responsive design with horizontal scroll for tables on mobile
- Brief explanatory text for each section

## Example Output (120 BPM)

### Reverb Settings

| Room Size | Pre-Delay | Decay Time | Total Time |
|-----------|-----------|------------|------------|
| Hall (2 Bars) | 62.5 ms | 3937.5 ms | 4000 ms |
| Large Room (1 Bar) | 31.25 ms | 1968.75 ms | 2000 ms |
| Small Room (1/2 Note) | 15.63 ms | 984.38 ms | 1000 ms |
| Tight Ambience (1/4 Note) | 3.91 ms | 496.09 ms | 500 ms |

### Delay Times

| Note Value | Normal | Dotted | Triplet |
|------------|--------|--------|---------|
| 1/1 (1 Bar) | 2000 ms / 0.5 Hz | 3000 ms / 0.33 Hz | 1333.33 ms / 0.75 Hz |
| 1/2 (2 Beats) | 1000 ms / 1 Hz | 1500 ms / 0.67 Hz | 666.67 ms / 1.5 Hz |
| 1/4 (1 Beat) | 500 ms / 2 Hz | 750 ms / 1.33 Hz | 333.33 ms / 3 Hz |
| 1/8 | 250 ms / 4 Hz | 375 ms / 2.67 Hz | 166.67 ms / 6 Hz |
| 1/16 | 125 ms / 8 Hz | 187.5 ms / 5.33 Hz | 83.33 ms / 12 Hz |
| 1/32 | 62.5 ms / 16 Hz | 93.75 ms / 10.67 Hz | 41.67 ms / 24 Hz |

## Future Considerations

- Tap tempo button for detecting BPM
- Copy-to-clipboard for individual values
- Swing/shuffle timing calculations
- Additional note subdivisions (1/256, 1/512)
- Save/recall favorite BPM values
