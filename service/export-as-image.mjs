import { snapdom } from 'snapdom';

/**
 * Utility class for exporting the canvas as a PNG using snapdom.
 */
export class ExportAsImage {
    /** @type {Dependencies} */
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Exports the given element as a PNG blob.
     * @param {HTMLElement} element 
     * @param {Object} [options={}]
     * @returns {Promise<Blob>}
     */
    async exportAsPng(element, options = {}) {
        if (!element) {
            throw new Error('No element provided for export');
        }

        try {
            // Using snapdom to convert element to PNG Blob.
            // Snapdom supports shadow dom and svg by default.
            // toBlob returns a promise that resolves to a Blob.
            const defaultOptions = {
                type: 'png',
                dpr: 2, // Use higher resolution for anti-aliasing
                backgroundColor: 'white' // Ensure background is solid white for PNGs
            };

            const blob = await snapdom.toBlob(element, { ...defaultOptions, ...options });
            return blob;
        } catch (error) {
            console.error('[ExportAsImage] Export failed:', error);
            throw error;
        }
    }
}
