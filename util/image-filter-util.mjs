/**
 * Utility for image filtering logic to ensure consistency across the application.
 */

/**
 * Calculates the individual CSS filter components based on layer data.
 * @param {Object} layer The layer data (from model or plain object)
 * @returns {Object} { sepia, hue, saturate, brightness, contrast }
 */
export function calculateFilters(layer) {
    const brightness = layer.brightness !== undefined ? parseInt(layer.brightness) : 100;
    const contrast = layer.contrast !== undefined ? parseInt(layer.contrast) : 100;
    const sepia = layer.sepia !== undefined ? parseFloat(layer.sepia) : 0;
    const hue = layer.hue !== undefined ? parseFloat(layer.hue) : 0;
    const saturate = layer.saturate !== undefined ? parseFloat(layer.saturate) : 1;

    return {
        sepia,
        hue,
        saturate,
        brightness,
        contrast
    };
}

/**
 * Returns the CSS filter string for a given set of filter components.
 * @param {Object} filterData { sepia, hue, saturate, brightness, contrast }
 * @returns {string} The CSS filter string
 */
export function getFilterString(filterData) {
    const { sepia, hue, saturate, brightness, contrast } = filterData;
    const b = brightness !== undefined ? brightness : 100;
    const c = contrast !== undefined ? contrast : 100;

    const filters = [];
    if (b !== 100) filters.push(`brightness(${b}%)`);
    if (c !== 100) filters.push(`contrast(${c}%)`);
    if (sepia !== 0) filters.push(`sepia(${sepia})`);
    if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
    if (saturate !== 1) filters.push(`saturate(${saturate})`);

    return filters.length > 0 ? filters.join(' ') : 'none';
}
