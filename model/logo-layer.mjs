import { produce } from 'immer';
import { Layer } from './layer.mjs';

/**
 * Layer subtype for rendering logos with auto-resolution and specific positions.
 */
export class LogoLayer extends Layer {
    /** @type {string} */
    type = 'logo';
    /** @type {string} */
    slot;
    /** @type {string|null} */
    logoId;
    /** @type {number} */
    width;
    /** @type {number} */
    opacity;
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
        super(id, data.name || 'Logo Layer', data.visible !== undefined ? data.visible : true, data.zIndex !== undefined ? data.zIndex : 10, deps);
        this.slot = data.slot || 'bottom-right';
        this.logoId = data.logoId || null;
        this.width = data.width !== undefined ? data.width : 200;
        this.opacity = data.opacity !== undefined ? data.opacity : 100;
        this.offsetX = data.offsetX || 0;
        this.offsetY = data.offsetY || 0;
    }

    withSlot(slot) {
        return produce(this, draft => { draft.slot = slot; });
    }

    withLogoId(logoId) {
        return produce(this, draft => { draft.logoId = logoId; });
    }

    withWidth(width) {
        return produce(this, draft => { draft.width = width; });
    }

    withOpacity(opacity) {
        return produce(this, draft => { draft.opacity = opacity; });
    }

    withOffsetX(offsetX) {
        return produce(this, draft => { draft.offsetX = offsetX; });
    }

    withOffsetY(offsetY) {
        return produce(this, draft => { draft.offsetY = offsetY; });
    }

    /**
     * @returns {Object} Plain data object for storage
     */
    toData() {
        return {
            ...super.toData(),
            type: this.type,
            slot: this.slot,
            logoId: this.logoId,
            width: this.width,
            opacity: this.opacity,
            offsetX: this.offsetX,
            offsetY: this.offsetY
        };
    }
}
