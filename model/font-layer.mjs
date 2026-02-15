import { produce } from 'immer';
import { Layer } from './layer.mjs';

/**
 * Layer subtype for rendering text with specific styles and positioning.
 */
export class FontLayer extends Layer {
    /** @type {string} */
    type = 'font';
    /** @type {string} */
    slot;
    /** @type {string} */
    styleId;
    /** @type {string} */
    text;
    /** @type {string} */
    html;
    /** @type {number|null} */
    size;
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
        super(id, data.name || 'Text Layer', data.visible !== undefined ? data.visible : true, deps);
        this.slot = data.slot || 'center-middle';
        this.styleId = data.styleId || '';
        this.text = data.text || '';
        this.html = data.html || '';
        this.size = data.size !== undefined ? data.size : null;
        this.offsetX = data.offsetX || 0;
        this.offsetY = data.offsetY || 0;
    }

    withSlot(slot) {
        return produce(this, draft => { draft.slot = slot; });
    }

    withStyleId(styleId) {
        return produce(this, draft => { draft.styleId = styleId; });
    }

    withText(text) {
        return produce(this, draft => { draft.text = text; });
    }

    withHtml(html) {
        return produce(this, draft => { draft.html = html; });
    }

    withSize(size) {
        return produce(this, draft => { draft.size = size; });
    }

    withOffsetX(offsetX) {
        return produce(this, draft => { draft.offsetX = offsetX; });
    }

    withOffsetY(offsetY) {
        return produce(this, draft => { draft.offsetY = offsetY; });
    }
}
