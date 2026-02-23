/**
 * Base adapter for extracting layer updates from form data.
 */
export class LayerFormAdapter {
    /**
     * @returns {string} The layer type handled by this adapter.
     */
    get type() {
        throw new Error('Not implemented');
    }

    /**
     * Extracts updated layer properties from the container element.
     * @param {Layer} layer - The original layer instance.
     * @param {HTMLElement} sidebar - The container element (sidebar).
     * @param {number} index - The layer's index in the creation's layers array.
     * @returns {Layer} The updated layer instance.
     */
    extractUpdated(layer, sidebar, index) {
        throw new Error('Not implemented');
    }
}
