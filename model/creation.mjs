import { produce, immerable } from 'immer';
import { Layer } from './layer.mjs';
import { FontLayer } from './font-layer.mjs';
import { IconLayer } from './icon-layer.mjs';
import { Dependencies } from '../util/dependencies.mjs';

/**
 * Immutable Creation class representing the dimensions, background, and layers of an image.
 */
export class Creation {
    [immerable] = true;

    /** @type {string} */
    id;
    /** @type {string} */
    title;
    /** @type {number} */
    width;
    /** @type {number} */
    height;
    /** @type {string} */
    backgroundImageId;
    /** @type {number} */
    backgroundScale;
    /** @type {number} */
    backgroundX;
    /** @type {number} */
    backgroundY;
    /** @type {ReadonlyArray<Layer>} */
    layers;

    /**
     * @param {string|null} id
     * @param {Object} data
     * @param {Dependencies} [deps]
     */
    constructor(id, data = {}, deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        
        // Apply data properties
        Object.assign(this, data);
        
        // Ensure layers is always an array of appropriate Layer objects
        if (this.layers) {
            this.layers = this.layers.map(layerData => {
                if (layerData instanceof Layer) return layerData;
                if (layerData.type === 'font') {
                    return new FontLayer(layerData.id, layerData, deps);
                }
                if (layerData.type === 'icon') {
                    return new IconLayer(layerData.id, layerData, deps);
                }
                return new Layer(layerData.id, layerData.name, layerData.visible, deps);
            });
        } else {
            this.layers = [];
        }
    }

    /**
     * @param {string} width
     * @returns {Creation}
     */
    withTitle(title) {
        return produce(this, draft => {
            draft.title = title;
        });
    }

    /**
     * @param {number} width
     * @returns {Creation}
     */
    withWidth(width) {
        return produce(this, draft => {
            draft.width = width;
        });
    }

    /**
     * @param {number} height
     * @returns {Creation}
     */
    withHeight(height) {
        return produce(this, draft => {
            draft.height = height;
        });
    }

    /**
     * @param {string} backgroundImageId
     * @returns {Creation}
     */
    withBackgroundImageId(backgroundImageId) {
        return produce(this, draft => {
            draft.backgroundImageId = backgroundImageId;
        });
    }

    /**
     * @param {number} backgroundScale
     * @returns {Creation}
     */
    withBackgroundScale(backgroundScale) {
        return produce(this, draft => {
            draft.backgroundScale = backgroundScale;
        });
    }

    /**
     * @param {number} backgroundX
     * @returns {Creation}
     */
    withBackgroundX(backgroundX) {
        return produce(this, draft => {
            draft.backgroundX = backgroundX;
        });
    }

    /**
     * @param {number} backgroundY
     * @returns {Creation}
     */
    withBackgroundY(backgroundY) {
        return produce(this, draft => {
            draft.backgroundY = backgroundY;
        });
    }

    /**
     * @param {Layer[]} layers
     * @returns {Creation}
     */
    withLayers(layers) {
        return produce(this, draft => {
            draft.layers = [...layers];
        });
    }

    /**
     * Adds a layer to the canvas.
     * @param {Layer} layer
     * @returns {Creation}
     */
    addLayer(layer) {
        return produce(this, draft => {
            draft.layers.push(layer);
        });
    }
}
