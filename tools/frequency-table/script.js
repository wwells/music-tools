/**
 * Note Frequency Table
 * Generates an interactive frequency table and plays tones using Web Audio API
 */

// Note names in chromatic order
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Octave range
const MIN_OCTAVE = 0;
const MAX_OCTAVE = 8;

// Reference pitch: A4 = 440 Hz (MIDI note 69)
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

// Audio context (created on first user interaction)
let audioContext = null;

/**
 * Calculate frequency for a given note and octave
 * Formula: f = 440 * 2^((n-69)/12) where n is MIDI note number
 */
function getFrequency(note, octave) {
    const noteIndex = NOTES.indexOf(note);
    const midiNote = (octave + 1) * 12 + noteIndex; // C0 = MIDI 12
    return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI) / 12);
}

/**
 * Format frequency for display
 */
function formatFrequency(freq) {
    if (freq < 100) {
        return freq.toFixed(2);
    } else if (freq < 1000) {
        return freq.toFixed(1);
    } else {
        return Math.round(freq).toString();
    }
}

/**
 * Initialize or get the audio context
 */
function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browsers require user interaction)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

/**
 * Play a tone at the given frequency
 */
function playTone(frequency, duration = 0.5) {
    const ctx = getAudioContext();
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Create gain node for envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    
    // Fade out to avoid clicks
    const fadeStart = ctx.currentTime + duration * 0.7;
    const fadeEnd = ctx.currentTime + duration;
    gainNode.gain.setValueAtTime(0.3, fadeStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, fadeEnd);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Start and stop
    oscillator.start(ctx.currentTime);
    oscillator.stop(fadeEnd);
    
    return duration * 1000; // Return duration in ms for UI feedback
}

/**
 * Handle cell click - play tone and show visual feedback
 */
function handleCellClick(event) {
    const cell = event.target;
    const frequency = parseFloat(cell.dataset.frequency);
    
    if (!frequency || isNaN(frequency)) return;
    
    // Play the tone
    const durationMs = playTone(frequency);
    
    // Visual feedback
    cell.classList.add('playing');
    setTimeout(() => {
        cell.classList.remove('playing');
    }, durationMs);
}

/**
 * Build the frequency table
 */
function buildTable() {
    const tbody = document.getElementById('frequency-tbody');
    if (!tbody) return;
    
    // Clear existing content
    tbody.innerHTML = '';
    
    // Create a row for each note
    NOTES.forEach((note, noteIndex) => {
        const row = document.createElement('tr');
        
        // Add class for sharp notes
        if (note.includes('#')) {
            row.classList.add('sharp-note');
        }
        
        // Note name cell
        const noteCell = document.createElement('td');
        noteCell.textContent = note;
        row.appendChild(noteCell);
        
        // Frequency cells for each octave
        for (let octave = MIN_OCTAVE; octave <= MAX_OCTAVE; octave++) {
            const freq = getFrequency(note, octave);
            const cell = document.createElement('td');
            
            cell.textContent = formatFrequency(freq);
            cell.dataset.frequency = freq;
            cell.dataset.note = note;
            cell.dataset.octave = octave;
            cell.title = `${note}${octave} - ${freq.toFixed(2)} Hz`;
            
            // Highlight A4 = 440 Hz reference
            if (note === 'A' && octave === 4) {
                cell.classList.add('reference');
            }
            
            // Add click handler
            cell.addEventListener('click', handleCellClick);
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', buildTable);
