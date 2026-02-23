import { produce } from 'immer';
import { Layer } from './layer.mjs';

/**
 * Layer subtype for rendering images with specific positions and sizes.
 */
export class ImageLayer extends Layer {
    /** @type {string} */
    type = 'image';
    /** @type {string} */
    slot;
    /** @type {string|null} */
    imageId;
    /** @type {number|null} */
    width;
    /** @type {number|null} */
    height;
    /** @type {number} */
    offsetX;
    /** @type {number} */
    offsetY;

    /**
     * @param {string|null} id
     * @param {Object} data
     * @param {Dependencies} [deps]
     */
    constructor(id, data = {}, deps = null) {
        super(id, data.name || 'Image Layer', data.visible !== undefined ? data.visible : true, data.zIndex !== undefined ? data.zIndex : 10, deps);
        this.slot = data.slot || 'center-middle';
        this.imageId = data.imageId || null;
        this.width = data.width !== undefined ? data.width : 200;
        this.height = data.height !== undefined ? data.height : null;
        this.offsetX = data.offsetX || 0;
        this.offsetY = data.offsetY || 0;
    }

    withSlot(slot) {
        return produce(this, draft => { draft.slot = slot; });
    }

    withImageId(imageId) {
        return produce(this, draft => { draft.imageId = imageId; });
    }

    withWidth(width) {
        return produce(this, draft => { draft.width = width; });
    }

    withHeight(height) {
        return produce(this, draft => { draft.height = height; });
    }

    withOffsetX(offsetX) {
        return produce(this, draft => { draft.offsetX = offsetX; });
    }

    withOffsetY(offsetY) {
        return produce(this, draft => { draft.offsetY = offsetY; });
    }
}
