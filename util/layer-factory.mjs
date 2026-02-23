import { FontLayer } from '../model/font-layer.mjs';
import { IconLayer } from '../model/icon-layer.mjs';
import { IconCalloutLayer } from '../model/icon-callout-layer.mjs';
import { ImageLayer } from '../model/image-layer.mjs';

/**
 * Factory for creating layers from types and presets.
 */
export class LayerFactory {
    /**
     * Creates a layer instance of the specified type.
     * @param {string} type - 'font', 'icon', 'icon-callout', or 'image'
     * @param {Object} data - Initial data for the layer
     * @param {Dependencies} deps - Application dependencies
     * @returns {Layer}
     */
    static createLayer(type, data, deps) {
        switch (type) {
            case 'font':
                return new FontLayer(null, data, deps);
            case 'icon':
                return new IconLayer(null, data, deps);
            case 'icon-callout':
                return new IconCalloutLayer(null, data, deps);
            case 'image':
                return new ImageLayer(null, data, deps);
            default:
                throw new Error(`Unknown layer type: ${type}`);
        }
    }

    /**
     * Fetches a preset and creates a layer from it.
     * @param {string} type - 'font', 'icon', 'icon-callout', or 'image'
     * @param {Dependencies} deps - Application dependencies
     * @returns {Promise<Layer>}
     */
    static async createFromPreset(type, deps) {
        const presetPath = `presets/layers/${type}.json`;
        const response = await fetch(presetPath);
        if (!response.ok) {
            throw new Error(`Failed to load preset for layer type: ${type}`);
        }
        const data = await response.json();
        return this.createLayer(type, data, deps);
    }
}
