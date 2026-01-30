/**
 * Delay & Reverb Calculator
 * Calculates delay times and reverb settings synchronized to BPM
 */

// Note value definitions with multipliers relative to quarter note
const NOTE_VALUES = [
    { name: '1/1 (Whole)', multiplier: 4 },
    { name: '1/2 (Half)', multiplier: 2 },
    { name: '1/4 (Quarter)', multiplier: 1 },
    { name: '1/8', multiplier: 0.5 },
    { name: '1/16', multiplier: 0.25 },
    { name: '1/32', multiplier: 0.125 },
    { name: '1/64', multiplier: 0.0625 },
    { name: '1/128', multiplier: 0.03125 }
];

// Reverb room size definitions
const REVERB_ROOMS = [
    { name: 'Hall (2 Bars)', totalMultiplier: 8, preDelayMultiplier: 0.125 },        // 2 bars, 1/32 pre-delay
    { name: 'Large Room (1 Bar)', totalMultiplier: 4, preDelayMultiplier: 0.0625 },  // 1 bar, 1/64 pre-delay
    { name: 'Small Room (1/2 Note)', totalMultiplier: 2, preDelayMultiplier: 0.03125 }, // 1/2 note, 1/128 pre-delay
    { name: 'Tight Ambience (1/4 Note)', totalMultiplier: 1, preDelayMultiplier: 0.0078125 } // 1/4 note, 1/512 pre-delay
];

// DOM Elements
const bpmInput = document.getElementById('bpm-input');
const reverbTbody = document.getElementById('reverb-tbody');
const delayTbody = document.getElementById('delay-tbody');

/**
 * Calculate quarter note duration in milliseconds
 * @param {number} bpm - Beats per minute
 * @returns {number} Quarter note duration in ms
 */
function getQuarterNoteMs(bpm) {
    return 60000 / bpm;
}

/**
 * Convert milliseconds to Hz
 * @param {number} ms - Duration in milliseconds
 * @returns {number} Frequency in Hz
 */
function msToHz(ms) {
    return 1000 / ms;
}

/**
 * Format milliseconds for display
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted string
 */
function formatMs(ms) {
    return ms.toFixed(2) + ' ms';
}

/**
 * Format Hz for display
 * @param {number} hz - Frequency in Hz
 * @returns {string} Formatted string
 */
function formatHz(hz) {
    return hz.toFixed(2) + ' Hz';
}

/**
 * Create a table cell with ms and Hz values
 * @param {number} ms - Duration in milliseconds
 * @returns {string} HTML for the cell content
 */
function createValueCell(ms) {
    const hz = msToHz(ms);
    return `<div class="value-cell">
        <span class="ms-value">${formatMs(ms)}</span>
        <span class="hz-value">${formatHz(hz)}</span>
    </div>`;
}

/**
 * Calculate and render the reverb settings table
 * @param {number} bpm - Beats per minute
 */
function renderReverbTable(bpm) {
    const quarterMs = getQuarterNoteMs(bpm);
    
    const rows = REVERB_ROOMS.map(room => {
        const totalMs = quarterMs * room.totalMultiplier;
        const preDelayMs = quarterMs * room.preDelayMultiplier;
        const decayMs = totalMs - preDelayMs;
        
        return `<tr>
            <td>${room.name}</td>
            <td>${formatMs(preDelayMs)}</td>
            <td>${formatMs(decayMs)}</td>
            <td>${formatMs(totalMs)}</td>
        </tr>`;
    });
    
    reverbTbody.innerHTML = rows.join('');
}

/**
 * Calculate and render the delay times table
 * @param {number} bpm - Beats per minute
 */
function renderDelayTable(bpm) {
    const quarterMs = getQuarterNoteMs(bpm);
    
    const rows = NOTE_VALUES.map(note => {
        const normalMs = quarterMs * note.multiplier;
        const dottedMs = normalMs * 1.5;
        const tripletMs = normalMs * (2 / 3);
        
        return `<tr>
            <td>${note.name}</td>
            <td>${createValueCell(normalMs)}</td>
            <td>${createValueCell(dottedMs)}</td>
            <td>${createValueCell(tripletMs)}</td>
        </tr>`;
    });
    
    delayTbody.innerHTML = rows.join('');
}

/**
 * Update all tables based on current BPM
 */
function updateTables() {
    let bpm = parseInt(bpmInput.value, 10);
    
    // Clamp BPM to valid range
    if (isNaN(bpm) || bpm < 20) {
        bpm = 20;
    } else if (bpm > 300) {
        bpm = 300;
    }
    
    renderReverbTable(bpm);
    renderDelayTable(bpm);
}

// Event listeners
bpmInput.addEventListener('input', updateTables);

// Also update on blur to handle edge cases
bpmInput.addEventListener('blur', () => {
    let bpm = parseInt(bpmInput.value, 10);
    if (isNaN(bpm) || bpm < 20) {
        bpmInput.value = 20;
    } else if (bpm > 300) {
        bpmInput.value = 300;
    }
    updateTables();
});

// Initial render
updateTables();
