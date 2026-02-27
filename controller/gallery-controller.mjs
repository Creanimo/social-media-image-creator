import { ImageService } from '../service/image-service.mjs';
import { GalleryComponent } from '../view/gallery-component.mjs';

/**
 * Controller for managing the image gallery.
 */
export class GalleryController {
    #deps;
    #gallery;

    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} container
     */
    constructor(deps, container) {
        this.#deps = deps;
        this.#gallery = new GalleryComponent(container, deps, {
            tabs: ['backgrounds', 'images'],
            onUpload: (file, category) => this.#handleUpload(file, category),
            onDelete: (id) => this.#handleDelete(id),
            onStartCreation: (id, category) => this.#handleStartCreation(id, category)
        });
    }

    /**
     * Initializes the gallery.
     */
    async init() {
        await this.#gallery.loadTemplates();
        await this.refresh();
    }

    /**
     * Refreshes the gallery data and re-renders.
     */
    async refresh() {
        const state = this.#gallery.getState();

        const uploadedImages = await this.#deps.imageRepository.getAll(this.#deps);
        const presetBackgrounds = await this.#deps.backgroundRepository.getAll();
        const imagePresets = await this.#deps.imagePresetRepository.getAll();

        const mapUploaded = img => ({
            id: img.id,
            src: this.#deps.imageUrlManager.getUrl(img.id, img.imageBlob),
            category: img.category,
            source: 'my-uploads',
            canDelete: true
        });

        const mapPreset = (bg, category = 'background') => ({
            ...bg,
            src: this.#deps.imageUrlManager.getUrl(bg.id, bg.imageBlob),
            category: category,
            source: 'pre-made',
            canDelete: false
        });

        const backgrounds = [
            ...uploadedImages.filter(img => img.category === 'background').map(mapUploaded),
            ...presetBackgrounds.map(bg => mapPreset(bg, 'background'))
        ];
        const images = [
            ...uploadedImages.filter(img => img.category === 'image').map(mapUploaded),
            ...imagePresets.map(preset => mapPreset(preset, 'image'))
        ];

        await this.#gallery.render({
            backgrounds: backgrounds,
            images: images
        });

        await this.#gallery.restoreState(state);
    }

    async #handleStartCreation(id, category) {
        const newCreation = await ImageService.startCreationFromImage(this.#deps, id, category);
        window.location.hash = `#editor?id=${newCreation.id}`;
    }

    /**
     * @param {File} file
     * @param {string} category
     */
    async #handleUpload(file, category) {
        await ImageService.saveUpload(this.#deps, file, category);
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
