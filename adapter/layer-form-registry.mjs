/**
 * Registry for layer form adapters.
 */
export class LayerFormRegistry {
    #adapters = new Map();

    /**
     * Registers an adapter.
     * @param {LayerFormAdapter} adapter
     * @returns {LayerFormRegistry}
     */
    register(adapter) {
        this.#adapters.set(adapter.type, adapter);
        return this;
    }

    /**
     * Gets an adapter by layer type.
     * @param {string} type
     * @returns {LayerFormAdapter|undefined}
     */
    get(type) {
        return this.#adapters.get(type);
    }
}
