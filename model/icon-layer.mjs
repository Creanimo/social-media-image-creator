import { produce } from 'immer';
import { Layer } from './layer.mjs';

/**
 * Layer subtype for rendering icons with specific positions and sizes.
 */
export class IconLayer extends Layer {
    /** @type {string} */
    type = 'icon';
    /** @type {string} */
    slot;
    /** @type {string} */
    icon;
    /** @type {number|null} */
    size;
    /** @type {number} */
    offsetX;
    /** @type {number} */
    offsetY;
    /** @type {string} */
    color;

    /**
     * @param {string|null} id
     * @param {Object} data
     * @param {Dependencies} [deps]
     */
    constructor(id, data = {}, deps = null) {
        super(id, data.name || 'Icon Layer', data.visible !== undefined ? data.visible : true, data.zIndex !== undefined ? data.zIndex : 10, deps);
        this.slot = data.slot || 'center-middle';
        this.icon = (data.icon || 'photo').replace('tabler:', '');
        this.size = data.size !== undefined ? data.size : 48;
        this.offsetX = data.offsetX || 0;
        this.offsetY = data.offsetY || 0;
        this.color = data.color || '#000000';
    }

    withSlot(slot) {
        return produce(this, draft => { draft.slot = slot; });
    }

    withIcon(icon) {
        return produce(this, draft => { draft.icon = (icon || 'photo').replace('tabler:', ''); });
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

    withColor(color) {
        return produce(this, draft => { draft.color = color; });
    }
}
