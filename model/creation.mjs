import { produce, immerable } from 'immer';
import { Layer } from './layer.mjs';
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
    /** @type {ReadonlyArray<Layer>} */
    layers;

    /**
     * @param {string|null} id
     * @param {number} width
     * @param {number} height
     * @param {string} backgroundImageId
     * @param {Layer[]} layers
     * @param {Dependencies} [deps]
     */
    constructor(id, title, width, height, backgroundImageId, layers = [], deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        this.title = title || "Untitled";
        this.width = width;
        this.height = height;
        this.backgroundImageId = backgroundImageId;
        this.layers = [...layers];
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
