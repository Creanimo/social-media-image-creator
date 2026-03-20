/**
 * Service to manage modal lifecycles and containers.
 */
export class ModalManager {
    #idGenerator;
    #modals = new Map();

    /**
     * @param {import('../util/id-generator.mjs').IdGenerator} idGenerator
     */
    constructor(idGenerator) {
        this.#idGenerator = idGenerator;
    }

    /**
     * Creates a container for a modal and appends it to the body.
     * @returns {HTMLElement}
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = `modal-container-${this.#idGenerator.generate()}`;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Removes a modal container from the body.
     * @param {HTMLElement} container
     */
    removeContainer(container) {
        if (container && container.parentNode === document.body) {
            document.body.removeChild(container);
        }
    }
}
