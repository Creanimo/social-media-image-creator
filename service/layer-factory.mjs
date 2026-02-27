import { FontLayer } from '../model/font-layer.mjs';
import { IconLayer } from '../model/icon-layer.mjs';
import { IconCalloutLayer } from '../model/icon-callout-layer.mjs';
import { ImageLayer } from '../model/image-layer.mjs';

/**
 * Factory for creating layers from types and presets.
 */
export class LayerFactory {
    /** @type {Dependencies} */
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Creates a layer instance of the specified type.
     * @param {string} type - 'font', 'icon', 'icon-callout', or 'image'
     * @param {Object} data - Initial data for the layer
     * @returns {Layer}
     */
    createLayer(type, data) {
        switch (type) {
            case 'font':
                return new FontLayer(null, data, this.#deps);
            case 'icon':
                return new IconLayer(null, data, this.#deps);
            case 'icon-callout':
                return new IconCalloutLayer(null, data, this.#deps);
            case 'image':
                return new ImageLayer(null, data, this.#deps);
            default:
                throw new Error(`Unknown layer type: ${type}`);
        }
    }

    /**
     * Fetches a preset and creates a layer from it.
     * @param {string} type - 'font', 'icon', 'icon-callout', or 'image'
     * @returns {Promise<Layer>}
     */
    async createFromPreset(type) {
        const presetPath = `presets/layers/${type}.json`;
        const response = await fetch(presetPath);
        if (!response.ok) {
            throw new Error(`Failed to load preset for layer type: ${type}`);
        }
        const data = await response.json();
        return this.createLayer(type, data);
    }
}
