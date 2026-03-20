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
    /** @type {number} */
    brightness;
    /** @type {number} */
    contrast;
    /** @type {number} */
    sepia;
    /** @type {number} */
    hue;
    /** @type {number} */
    saturate;

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
        this.brightness = data.brightness !== undefined ? data.brightness : 100;
        this.contrast = data.contrast !== undefined ? data.contrast : 100;
        this.sepia = data.sepia !== undefined ? data.sepia : 0;
        this.hue = data.hue !== undefined ? data.hue : 0;
        this.saturate = data.saturate !== undefined ? data.saturate : 1;
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

    withBrightness(brightness) {
        return produce(this, draft => { draft.brightness = brightness; });
    }

    withContrast(contrast) {
        return produce(this, draft => { draft.contrast = contrast; });
    }

    withSepia(sepia) {
        return produce(this, draft => { draft.sepia = sepia; });
    }

    withHue(hue) {
        return produce(this, draft => { draft.hue = hue; });
    }

    withSaturate(saturate) {
        return produce(this, draft => { draft.saturate = saturate; });
    }

    /**
     * @returns {Object} Plain data object for storage
     */
    toData() {
        return {
            ...super.toData(),
            type: this.type,
            slot: this.slot,
            imageId: this.imageId,
            width: this.width,
            height: this.height,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            brightness: this.brightness,
            contrast: this.contrast,
            sepia: this.sepia,
            hue: this.hue,
            saturate: this.saturate
        };
    }
}
