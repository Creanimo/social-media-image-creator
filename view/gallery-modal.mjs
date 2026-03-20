import Mustache from 'mustache';
import { Modal } from './modal.mjs';
import { GalleryComponent } from './gallery-component.mjs';

/**
 * Modal that contains a gallery component.
 */
export class GalleryModal extends Modal {
    #gallery;
    #config;
    #currentData;

    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} [container]
     * @param {Object} config - Configuration for GalleryComponent
     */
    constructor(deps, container, config = {}) {
        super(deps, container, 'view/templates/gallery-modal.mustache');
        this.#config = config;
    }

    /**
     * @param {Object} data - Data for gallery (e.g. { backgrounds, images })
     * @returns {Promise<{id: string, tabId: string}>}
     */
    async open(data) {
        this.#currentData = data;
        return super.open();
    }

    get config() {
        return this.#config;
    }

    async onRender(dialog) {
        const galleryContainer = dialog.querySelector('#gallery-component-container');
        this.#gallery = new GalleryComponent(galleryContainer, this.deps, {
            ...this.#config,
            isModal: true,
            onSelect: (id, tabId) => this.submit({ id, tabId }),
            onUpload: this.#config.onUpload // Keep upload handler if passed
        });

        await this.#gallery.loadTemplates();
        await this.#gallery.render(this.#currentData);

        dialog.addEventListener('click', (e) => {
            if (e.target.closest('#close-gallery-modal')) {
                this.cancel();
            }
        });
    }

    async refresh(data) {
        this.#currentData = data;
        if (this.#gallery) {
            const state = this.#gallery.getState();
            await this.#gallery.render(data);
            await this.#gallery.restoreState(state);
        }
    }
}
