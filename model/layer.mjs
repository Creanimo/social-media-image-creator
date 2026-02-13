import { immerable } from 'immer';
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

    /**
     * @param {string|null} id
     * @param {string} name
     * @param {boolean} [visible=true]
     * @param {Dependencies} [deps]
     */
    constructor(id, name, visible = true, deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        this.name = name;
        this.visible = visible;
    }

    /**
     * @param {boolean} visible
     * @returns {Layer}
     */
    withVisible(visible) {
        if (this.visible === visible) return this;
        const next = new Layer(this.id, this.name, visible);
        return next;
    }
}
