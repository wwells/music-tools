/**
 * Initial Compressor Settings Calculator
 * Calculates attack and release times synchronized to BPM, and adapts them
 * to the 4 styles of compression (Consistent, Thick, Punchy, Groove) based
 * on a rough model of each mix element's transient.
 */

// Note multipliers relative to a quarter note
const NOTES = {
    '1/64': 0.0625,
    '1/32': 0.125,
    '1/16': 0.25,
    '1/8': 0.5,
    '1/4': 1,
    '1/2': 2
};

// The 4 styles of compression: each is a combination of a fast/slow attack
// (grab the transient vs. let it through) and a fast/slow release
// (snap back quickly vs. let the tail decay naturally).
const STYLES = {
    consistent: {
        label: 'Consistent',
        attack: 'fast',
        release: 'slow',
        description: 'Fast attack grabs the transient peak; slow release lets the tail decay naturally for even, unnoticed leveling.'
    },
    thick: {
        label: 'Thick',
        attack: 'fast',
        release: 'fast',
        description: 'Fast attack grabs the transient peak; fast release snaps back quickly, adding density and pushing depth farther back.'
    },
    punchy: {
        label: 'Punchy',
        attack: 'slow',
        release: 'slow',
        description: 'Slow attack lets the transient through untouched; slow release holds the squeeze on the sustain to exaggerate the hit.'
    },
    groove: {
        label: 'Groove',
        attack: 'slow',
        release: 'fast',
        description: 'Slow attack lets the transient through untouched; fast release snaps back in time with the tempo, locking into the pocket.'
    }
};

// Recommended compressor settings per mix element.
// fastAttackMs / slowAttackMs: rough, fixed (non-tempo) estimates of how
// long each element's transient peak actually is, and how long an attack
// needs to be to let that transient pass through uncompressed.
// tailNote / fastReleaseNote: tempo-synced note values for a natural decay
// tail (slow release) vs. a snappier, pumping release (fast release).
const MIX_ELEMENTS = [
    { name: 'Kick', fastAttackMs: 5, slowAttackMs: 25, tailNote: '1/8', fastReleaseNote: '1/32' },
    { name: 'Snare', fastAttackMs: 3, slowAttackMs: 15, tailNote: '1/8', fastReleaseNote: '1/32' },
    { name: 'Drum Subgroup', fastAttackMs: 5, slowAttackMs: 20, tailNote: '1/4', fastReleaseNote: '1/16' },
    { name: 'Bass', fastAttackMs: 10, slowAttackMs: 30, tailNote: '1/4', fastReleaseNote: '1/16' },
    { name: 'Mix Bus', fastAttackMs: 10, slowAttackMs: 30, tailNote: '1/2', fastReleaseNote: '1/8' },
    { name: 'Vocal', fastAttackMs: 5, slowAttackMs: 25, tailNote: '1/2', fastReleaseNote: '1/8' }
];

const bpmInput = document.getElementById('bpm-input');
const compressorTbody = document.getElementById('compressor-tbody');
const styleButtons = document.querySelectorAll('.style-btn');
const styleSelectLinks = document.querySelectorAll('.style-select-btn');
const styleDescription = document.getElementById('style-description');
const mixElementSection = document.getElementById('mix-element-settings');

let currentStyle = 'consistent';

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
 * Create a table cell with note label and calculated ms value (used for
 * tempo-synced release times).
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
 * Create a table cell for a fixed (non-tempo-synced) attack time, labeled
 * with what that attack speed is doing to the transient.
 * @param {number} ms - Fixed attack duration in milliseconds
 * @param {'fast'|'slow'} speed - Attack speed for this style
 * @returns {string} HTML for the cell content
 */
function createAttackCell(ms, speed) {
    const label = speed === 'fast' ? 'grab transient' : 'let transient through';
    return `<div class="time-cell">
        <span class="note-label">${label}</span>
        <span class="ms-value">~${ms} ms</span>
    </div>`;
}

/**
 * Calculate and render the compressor settings table for the current style
 * @param {number} bpm - Beats per minute
 * @param {string} styleKey - Key into STYLES
 */
function renderCompressorTable(bpm, styleKey) {
    const style = STYLES[styleKey];

    const rows = MIX_ELEMENTS.map(element => {
        const attackMs = style.attack === 'fast' ? element.fastAttackMs : element.slowAttackMs;
        const releaseNote = style.release === 'slow' ? element.tailNote : element.fastReleaseNote;
        const releaseMs = noteToMs(bpm, releaseNote);

        return `<tr>
            <td>${element.name}</td>
            <td>${createAttackCell(attackMs, style.attack)}</td>
            <td>${createTimeCell(releaseNote, releaseMs)}</td>
        </tr>`;
    });

    compressorTbody.innerHTML = rows.join('');
    styleDescription.textContent = style.description;
}

/**
 * Update table based on current BPM and selected style
 */
function updateTable() {
    let bpm = parseInt(bpmInput.value, 10);

    if (isNaN(bpm) || bpm < 20) {
        bpm = 20;
    } else if (bpm > 300) {
        bpm = 300;
    }

    renderCompressorTable(bpm, currentStyle);
}

/**
 * Set the active compression style and re-render the table
 * @param {string} styleKey - Key into STYLES
 */
function setStyle(styleKey) {
    if (!STYLES[styleKey] || styleKey === currentStyle) {
        return;
    }

    currentStyle = styleKey;

    styleButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === styleKey);
    });

    updateTable();
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

styleButtons.forEach(btn => {
    btn.addEventListener('click', () => setStyle(btn.dataset.style));
});

styleSelectLinks.forEach(btn => {
    btn.addEventListener('click', () => {
        setStyle(btn.dataset.style);
        mixElementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

updateTable();
