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
     * @returns {Creation}
     */
    repairZIndex() {
        const sortedLayers = [...this.layers]
            .map((layer, originalIndex) => ({ layer, originalIndex }))
            .sort((a, b) => {
                const zDiff = (a.layer.zIndex || 0) - (b.layer.zIndex || 0);
                if (zDiff !== 0) return zDiff;
                return a.originalIndex - b.originalIndex;
            });

        let changed = false;
        const newLayers = [...this.layers];
        
        sortedLayers.forEach((item, i) => {
            const expectedZ = i + 1;
            if (item.layer.zIndex !== expectedZ) {
                changed = true;
                newLayers[item.originalIndex] = item.layer.withZIndex(expectedZ);
            }
        });

        if (changed) {
            console.log(`Layer z-index repaired for creation ${this.id}`);
            return this.withLayers(newLayers);
        }
        return this;
    }

    /**
     * @param {number} layerIndex
     * @returns {Creation}
     */
    bringToFront(layerIndex) {
        const layer = this.layers[layerIndex];
        if (!layer) return this;

        const maxZ = this.layers.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);
        const newLayers = [...this.layers];
        newLayers[layerIndex] = layer.withZIndex(maxZ + 1);
        
        return this.withLayers(newLayers).repairZIndex();
    }

    /**
     * @param {number} layerIndex
     * @returns {Creation}
     */
    sendToBack(layerIndex) {
        const layer = this.layers[layerIndex];
        if (!layer) return this;

        const minZ = this.layers.reduce((min, l) => Math.min(min, l.zIndex || 0), Infinity);
        const newLayers = [...this.layers];
        newLayers[layerIndex] = layer.withZIndex(minZ - 1);
        
        return this.withLayers(newLayers).repairZIndex();
    }

    /**
     * Adds a layer to the canvas.
     * @param {Layer} layer
     * @returns {Creation}
     */
    addLayer(layer) {
        return produce(this, draft => {
            const maxZ = draft.layers.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);
            draft.layers.push(layer.withZIndex(maxZ + 1));
        });
    }
}
