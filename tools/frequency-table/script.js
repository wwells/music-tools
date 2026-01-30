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
 * Initialize and unlock the audio context
 * Must be called synchronously from a user gesture on iOS
 */
function initAudio() {
    if (audioEnabled && audioContext && audioContext.state === 'running') {
        return true;
    }
    
    try {
        // Create audio context - must happen synchronously in gesture
        if (!audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            updateStatus('Context created: ' + audioContext.state);
        }
        
        // Resume and play tone
        audioContext.resume().then(() => {
            updateStatus('Resumed: ' + audioContext.state);
            
            // Play a tone after resume completes
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            gain.gain.value = 0.3;
            osc.frequency.value = 440;
            osc.start();
            osc.stop(audioContext.currentTime + 0.3);
            
            audioEnabled = true;
            updateStatus('Playing tone... State: ' + audioContext.state);
            
            // Hide prompt after short delay
            setTimeout(() => {
                const prompt = document.getElementById('audio-prompt');
                if (prompt) prompt.hidden = true;
            }, 500);
        }).catch(e => {
            updateStatus('Resume failed: ' + e.message);
        });
        
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
 * Play a tone at the given frequency
 */
function playTone(frequency, duration = 0.5) {
    // Initialize audio if needed (will work on desktop click, mobile needs button first)
    if (!audioEnabled || !audioContext) {
        const success = initAudio();
        if (!success) {
            return 500;
        }
    }
    
    try {
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // Create gain node for envelope
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        // Fade out to avoid clicks
        const fadeStart = audioContext.currentTime + duration * 0.7;
        const fadeEnd = audioContext.currentTime + duration;
        gainNode.gain.setValueAtTime(0.3, fadeStart);
        gainNode.gain.exponentialRampToValueAtTime(0.001, fadeEnd);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start and stop
        oscillator.start(audioContext.currentTime);
        oscillator.stop(fadeEnd);
        
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
