import { GalleryComponent } from '../view/gallery-component.mjs';
import { CropModal } from '../view/crop-modal.mjs';

/**
 * Controller for managing the image gallery.
 */
export class GalleryController {
    #deps;
    #gallery;
    #cropModal;

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

        this.#cropModal = null;
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
            src: this.#deps.imageUrlManager.createUrl(img.id, img.imageBlob),
            category: img.category,
            source: 'my-uploads',
            canDelete: true
        });

        const mapPreset = (bg, category = 'background') => ({
            ...bg,
            src: this.#deps.imageUrlManager.createUrl(bg.id, bg.imageBlob),
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

    /**
     * @param {File} file
     * @param {string} category
     */
    async #handleUpload(file, category) {
        try {
            console.log('GalleryController: opening crop modal for file', file);
            this.#cropModal = new CropModal(this.#deps);
            const result = await this.#cropModal.show(file);
            console.log('GalleryController: crop modal result', result);
            if (result.mode === 'no-crop') {
                await this.#deps.imageService.saveUpload(file, category);
            } else {
                await this.#deps.imageService.saveUpload(result.blob, category);
            }
            await this.refresh();
        } catch (e) {
            console.error('GalleryController: crop modal error or cancel', e);
            // Cancelled
        }
    }

    /**
     * @param {string} id
     * @param {string} category
     */
    async #handleStartCreation(id, category) {
        const image = await this.#deps.imageService.getImage(id);
        if (image) {
            try {
                console.log('GalleryController: opening crop modal for existing image', image);
                this.#cropModal = new CropModal(this.#deps);
                const result = await this.#cropModal.show(image);
                console.log('GalleryController: crop modal result', result);
                let finalId = id;
                if (result.mode === 'new') {
                    const newImage = await this.#deps.imageService.saveUpload(result.blob, category);
                    finalId = newImage.id;
                } else if (result.mode === 'override') {
                    await this.#deps.imageService.saveUpload(result.blob, category, id);
                }
                // if mode is 'no-crop', we just use the original 'id'
                const newCreation = await this.#deps.imageService.startCreationFromImage(finalId, category);
                window.location.hash = `#editor?id=${newCreation.id}`;
            } catch (e) {
                console.error('GalleryController: crop modal error or cancel (existing image)', e);
                // Cancelled
            }
        } else {
            const newCreation = await this.#deps.imageService.startCreationFromImage(id, category);
            window.location.hash = `#editor?id=${newCreation.id}`;
        }
    }

    /**
     * @param {string} id
     */
    async #handleDelete(id) {
        await this.#deps.imageRepository.delete(id);
        await this.refresh();
    }
}
