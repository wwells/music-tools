/**
 * Initial Compressor Settings Calculator
 * Calculates attack and release times synchronized to BPM
 */

// Note multipliers relative to a quarter note
const NOTES = {
    '1/64': 0.0625,
    '1/32': 0.125,
    '1/16': 0.25,
    '1/4': 1
};

// Recommended compressor settings per mix element
const MIX_ELEMENTS = [
    { name: 'Kick', ratio: '2:1', attack: '1/64', release: '1/16' },
    { name: 'Snare', ratio: '2:1', attack: '1/64', release: '1/16' },
    { name: 'Drum Subgroup', ratio: '2:1', attack: '1/64', release: '1/16' },
    { name: 'Bass', ratio: '12:1', attack: '1/32', release: '1/16' },
    { name: 'Mix Bus', ratio: '2:1', attack: '1/16', release: '1/16' },
    { name: 'Vocal', ratio: '4:1', attack: '1/16', release: '1/4' }
];

const bpmInput = document.getElementById('bpm-input');
const compressorTbody = document.getElementById('compressor-tbody');

/**
 * Calculate quarter note duration in milliseconds
 * @param {number} bpm - Beats per minute
 * @returns {number} Quarter note duration in ms
 */
function getQuarterNoteMs(bpm) {
    return 60000 / bpm;
}

/**
 * Calculate note duration in milliseconds
 * @param {number} bpm - Beats per minute
 * @param {string} note - Note key from NOTES
 * @returns {number} Duration in ms
 */
function noteToMs(bpm, note) {
    return getQuarterNoteMs(bpm) * NOTES[note];
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
 * Create a table cell with note label and calculated ms value
 * @param {string} note - Note label
 * @param {number} ms - Duration in milliseconds
 * @returns {string} HTML for the cell content
 */
function createTimeCell(note, ms) {
    return `<div class="time-cell">
        <span class="note-label">${note} note</span>
        <span class="ms-value">${formatMs(ms)}</span>
    </div>`;
}

/**
 * Calculate and render the compressor settings table
 * @param {number} bpm - Beats per minute
 */
function renderCompressorTable(bpm) {
    const rows = MIX_ELEMENTS.map(element => {
        const attackMs = noteToMs(bpm, element.attack);
        const releaseMs = noteToMs(bpm, element.release);

        return `<tr>
            <td>${element.name}</td>
            <td>${element.ratio}</td>
            <td>${createTimeCell(element.attack, attackMs)}</td>
            <td>${createTimeCell(element.release, releaseMs)}</td>
        </tr>`;
    });

    compressorTbody.innerHTML = rows.join('');
}

/**
 * Update table based on current BPM
 */
function updateTable() {
    let bpm = parseInt(bpmInput.value, 10);

    if (isNaN(bpm) || bpm < 20) {
        bpm = 20;
    } else if (bpm > 300) {
        bpm = 300;
    }

    renderCompressorTable(bpm);
}

bpmInput.addEventListener('input', updateTable);

bpmInput.addEventListener('blur', () => {
    let bpm = parseInt(bpmInput.value, 10);
    if (isNaN(bpm) || bpm < 20) {
        bpmInput.value = 20;
    } else if (bpm > 300) {
        bpmInput.value = 300;
    }
    updateTable();
});

updateTable();
