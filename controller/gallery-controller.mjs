import { GalleryComponent } from '../view/gallery-component.mjs';
import { CropModal } from '../view/crop-modal.mjs';
import { ImageUtils } from '../util/image-utils.mjs';
import { ModalCancelledError } from '../util/modal-cancelled-error.mjs';

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
            tabs: ['backgrounds', 'images', 'logos'],
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
        const logoPresets = await this.#deps.logoRepository.getAll();

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
        const logos = [
            ...uploadedImages.filter(img => img.category === 'logo').map(mapUploaded),
            ...logoPresets.map(preset => mapPreset(preset, 'logo'))
        ];

        await this.#gallery.render({
            backgrounds: backgrounds,
            images: images,
            logos: logos
        });

        await this.#gallery.restoreState(state);
    }

    /**
     * @param {File} file
     * @param {string} category
     */
    async #handleUpload(file, category) {
        try {
            if (!ImageUtils.isCroppable(file)) {
                await this.#deps.imageService.saveUpload(file, category);
                await this.refresh();
                return;
            }

            console.log('GalleryController: opening crop modal for file', file);
            this.#cropModal = new CropModal(this.#deps);
            const result = await this.#cropModal.show(file);
            console.log('GalleryController: crop modal result', result);
            if (result.mode === 'no-crop') {
                await this.#deps.imageService.saveUpload(file, category);
            } else {
                // If it was cropped, it's a new Blob, but we can still try to preserve the name if it was a File
                const blob = result.blob;
                if (file instanceof File && !(blob instanceof File)) {
                    // Create a new File from the Blob with the original name
                    const namedFile = new File([blob], file.name, { type: blob.type });
                    await this.#deps.imageService.saveUpload(namedFile, category);
                } else {
                    await this.#deps.imageService.saveUpload(blob, category);
                }
            }
            await this.refresh();
        } catch (e) {
            if (!(e instanceof ModalCancelledError)) {
                console.error('GalleryController: crop modal error', e);
            }
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
                if (!ImageUtils.isCroppable(image)) {
                    const newCreation = await this.#deps.imageService.startCreationFromImage(id, category);
                    window.location.hash = `#editor?id=${newCreation.id}`;
                    return;
                }

                console.log('GalleryController: opening crop modal for existing image', image);
                this.#cropModal = new CropModal(this.#deps);
                const result = await this.#cropModal.show(image);
                console.log('GalleryController: crop modal result', result);
                let finalId = id;
                if (result.mode === 'new') {
                    // Create a new File with the original name if available
                    let uploadData = result.blob;
                    if (image && image.name && !(uploadData instanceof File)) {
                        uploadData = new File([result.blob], image.name, { type: result.blob.type });
                    }
                    const newImage = await this.#deps.imageService.saveUpload(uploadData, category);
                    finalId = newImage.id;
                } else if (result.mode === 'override') {
                    let uploadData = result.blob;
                    if (image && image.name && !(uploadData instanceof File)) {
                        uploadData = new File([result.blob], image.name, { type: result.blob.type });
                    }
                    await this.#deps.imageService.saveUpload(uploadData, category, id);
                }
                // if mode is 'no-crop', we just use the original 'id'
                const newCreation = await this.#deps.imageService.startCreationFromImage(finalId, category);
                window.location.hash = `#editor?id=${newCreation.id}`;
            } catch (e) {
                if (!(e instanceof ModalCancelledError)) {
                    console.error('GalleryController: crop modal error (existing image)', e);
                }
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
