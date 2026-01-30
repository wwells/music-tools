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

// Audio state
let audioContext = null;
let audioEnabled = false;

/**
 * Check if device is likely mobile/touch
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

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
 * Update status display for debugging
 */
function updateStatus(message) {
    const status = document.getElementById('audio-status');
    if (status) {
        status.textContent = message;
    }
}

/**
 * Generate a WAV file data URI for a sine wave tone
 */
function generateToneDataURI(frequency, duration, sampleRate = 44100) {
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave samples
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, Math.min(t * 20, (duration - t) * 20));
        const sample = Math.sin(2 * Math.PI * frequency * t) * 0.4 * envelope;
        view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
}

/**
 * Initialize and unlock audio using HTML5 Audio element (works on iOS)
 */
function initAudio() {
    if (audioEnabled && audioContext && audioContext.state === 'running') {
        return true;
    }
    
    try {
        updateStatus('Creating audio...');
        
        // Create and play audio element - this works on iOS
        const audio = new Audio(generateToneDataURI(440, 0.3));
        audio.volume = 0.5;
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                updateStatus('Audio playing via HTML5 Audio');
                
                // Now create Web Audio context for future use
                if (!audioContext) {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    audioContext = new AudioContextClass();
                }
                
                audioContext.resume().then(() => {
                    audioEnabled = true;
                    updateStatus('Audio enabled! Context: ' + audioContext.state);
                    
                    setTimeout(() => {
                        const prompt = document.getElementById('audio-prompt');
                        if (prompt) prompt.hidden = true;
                    }, 400);
                });
            }).catch(e => {
                updateStatus('Play failed: ' + e.message);
            });
        }
        
        return true;
    } catch (e) {
        updateStatus('Error: ' + e.message);
        return false;
    }
}

/**
 * Handle enable audio button click
 */
function handleEnableAudio(event) {
    event.preventDefault();
    updateStatus('Button tapped...');
    initAudio();
}

/**
 * Show audio prompt on touch devices
 */
function setupAudioPrompt() {
    const prompt = document.getElementById('audio-prompt');
    const btn = document.getElementById('enable-audio-btn');
    
    if (isTouchDevice() && prompt && btn) {
        prompt.hidden = false;
        // Use both click and touchend for maximum compatibility
        btn.addEventListener('click', handleEnableAudio);
        btn.addEventListener('touchend', handleEnableAudio);
    }
    // On desktop, audio will be initialized on first click (no prompt needed)
}

/**
 * Play a tone at the given frequency using HTML5 Audio (works on iOS)
 */
function playTone(frequency, duration = 0.5) {
    // On desktop (non-touch), enable audio on first play
    if (!audioEnabled && !isTouchDevice()) {
        audioEnabled = true;
    }
    
    if (!audioEnabled) {
        return 500;
    }
    
    try {
        const audio = new Audio(generateToneDataURI(frequency, duration));
        audio.volume = 0.5;
        audio.play().catch(e => console.warn('Could not play tone:', e));
        return duration * 1000;
    } catch (e) {
        console.warn('Could not play tone:', e);
        return 500;
    }
}

/**
 * Handle cell click - play tone and show visual feedback
 */
function handleCellClick(event) {
    const cell = event.target;
    const frequency = parseFloat(cell.dataset.frequency);
    
    if (!frequency || isNaN(frequency)) return;
    
    // Visual feedback immediately
    cell.classList.add('playing');
    
    // Play the tone
    const durationMs = playTone(frequency);
    
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
            
            // Add click handler (works on both desktop and mobile)
            cell.addEventListener('click', handleCellClick);
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    buildTable();
    setupAudioPrompt();
});
