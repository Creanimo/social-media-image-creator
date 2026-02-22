import { immerable, produce } from 'immer';
import { Dependencies } from '../util/dependencies.mjs';

/**
 * Immutable Layer class.
 */
export class Layer {
    [immerable] = true;

    /** @type {string} */
    id;
    /** @type {string} */
    name;
    /** @type {boolean} */
    visible;
    /** @type {number} */
    zIndex;

    /**
     * @param {string|null} id
     * @param {string} name
     * @param {boolean} [visible=true]
     * @param {number} [zIndex=10]
     * @param {Dependencies} [deps]
     */
    constructor(id, name, visible = true, zIndex = 10, deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        this.name = name;
        this.visible = visible;
        this.zIndex = zIndex;
    }

    /**
     * @param {number} zIndex
     * @returns {Layer}
     */
    withZIndex(zIndex) {
        if (this.zIndex === zIndex) return this;
        return produce(this, draft => {
            draft.zIndex = zIndex;
        });
    }

    /**
     * @param {boolean} visible
     * @returns {Layer}
     */
    withVisible(visible) {
        if (this.visible === visible) return this;
        return produce(this, draft => {
            draft.visible = visible;
        });
    }

    /**
     * @param {boolean} visible
     * @returns {Layer}
     */
    withName(name) {
        if (this.name === name) return this;
        return produce(this, draft => {
            draft.name = name;
        });

    }
}
