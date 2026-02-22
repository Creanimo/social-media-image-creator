import { snapdom } from 'snapdom';

/**
 * Utility class for exporting the canvas as a PNG using snapdom.
 */
export class ExportPipeline {
    /**
     * Exports the given element as a PNG blob.
     * @param {HTMLElement} element 
     * @returns {Promise<Blob>}
     */
    static async exportAsPng(element) {
        if (!element) {
            throw new Error('No element provided for export');
        }

        try {
            // Using snapdom to convert element to PNG Blob.
            // Snapdom supports shadow dom and svg by default.
            // toBlob returns a promise that resolves to a Blob.
            const blob = await snapdom.toBlob(element, { type: 'png' });
            return blob;
        } catch (error) {
            console.error('[ExportPipeline] Export failed:', error);
            throw error;
        }
    }
}
