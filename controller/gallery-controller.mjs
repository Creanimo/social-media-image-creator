import { Image } from '../model/image.mjs';
import { GalleryView } from '../view/gallery-view.mjs';

/**
 * Controller for managing the image gallery.
 */
export class GalleryController {
    #deps;
    #view;

    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} container
     */
    constructor(deps, container) {
        this.#deps = deps;
        this.#view = new GalleryView(container, deps.imageUrlManager);
    }

    /**
     * Initializes the gallery.
     */
    async init() {
        await this.#view.loadTemplates();
        await this.refresh();
    }

    /**
     * Refreshes the gallery data and re-renders.
     */
    async refresh() {
        const images = await this.#deps.imageRepository.getAll(this.#deps);
        this.#view.render(images);
        this.#bindEvents();
    }

    #bindEvents() {
        const container = this.#view.container;
        // Upload trigger
        const uploadTrigger = container.querySelector('#upload-trigger');
        const fileInput = container.querySelector('#image-upload');

        uploadTrigger?.addEventListener('click', () => fileInput?.click());

        fileInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.#handleUpload(file);
                // Clear input
                e.target.value = '';
            }
        });

        // Delete buttons
        const deleteButtons = container.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (id) {
                    await this.#handleDelete(id);
                }
            });
        });
    }

    /**
     * @param {File} file
     */
    async #handleUpload(file) {
        const newImage = new Image(null, file, this.#deps);
        await this.#deps.imageRepository.save(newImage);
        await this.refresh();
    }

    /**
     * @param {string} id
     */
    async #handleDelete(id) {
        await this.#deps.imageRepository.delete(id);
        await this.refresh();
    }
}
