import { GalleryModal } from '../view/gallery-modal.mjs';
import { CropModal } from '../view/crop-modal.mjs';
import { ImageUtils } from '../util/image-utils.mjs';
import { ModalCancelledError } from '../util/modal-cancelled-error.mjs';

/**
 * Controller/Orchestrator for gallery interactions within modals.
 */
export class GalleryFlow {
    #deps;
    #galleryModal;
    #cropModal;
    #target;
    #onApply;
    #isOpen = false;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;

        this.#galleryModal = null;
        this.#cropModal = null;
    }

    /**
     * Opens the gallery modal.
     * @param {string[]} tabs - List of tab IDs
     * @param {'background'|'layer'} target - Application target
     * @param {Function} onApply - Callback function called with { id, category, target }
     */
    async open(tabs, target, onApply) {
        if (this.#isOpen) return;
        this.#isOpen = true;

        this.#target = target;
        this.#onApply = onApply;

        try {
            await this.#run(tabs);
        } finally {
            this.#isOpen = false;
        }
    }

    async #run(tabs) {
        console.log('GalleryFlow: running with tabs', tabs);
        this.#galleryModal = new GalleryModal(this.#deps, undefined, {
            tabs: tabs,
            onUpload: (file, category) => this.#handleUpload(file, category)
        });

        const data = await this.#getGalleryData();
        
        try {
            const result = await this.#galleryModal.open(data);
            console.log('GalleryFlow: galleryModal.open result', result);
            
            // Check if it's a special result from upload or other internal transition
            if (result && result.type === 'transition') {
                return; // The transition logic (e.g. handleUpload) will take over
            }
            
            const { id, tabId } = result;
            await this.#handleSelect(id, tabId);
        } catch (e) {
            if (!(e instanceof ModalCancelledError)) {
                console.error('GalleryFlow: galleryModal.open error', e);
            }
            // Cancelled
        }
    }

    async #getGalleryData() {
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

        return { backgrounds, images, logos };
    }

    async #handleSelect(id, tabId) {
        const category = this.#deps.categoryUtils.normalize(tabId);
        const image = await this.#deps.imageService.getImage(id);
        
        if (image) {
            if (ImageUtils.isCroppable(image)) {
                // Mark as transition to prevent the galleryModal's open() from rejecting with an error
                this.#galleryModal.submit({ type: 'transition' });

                // Hide gallery before showing crop modal
                await this.#galleryModal.hide();

                try {
                    console.log('GalleryFlow: opening crop modal for existing image', image);
                    this.#cropModal = new CropModal(this.#deps);
                    const result = await this.#cropModal.show(image);
                    console.log('GalleryFlow: crop modal result', result);
                    let finalId = id;
                    if (result.mode === 'new') {
                        const newImage = await this.#deps.imageService.saveUpload(result.blob, category);
                        finalId = newImage.id;
                    } else if (result.mode === 'override') {
                        await this.#deps.imageService.saveUpload(result.blob, category, id);
                    }
                    // if mode is 'no-crop', we just use the original 'id'
                    await this.#apply(finalId, category);
                } catch (e) {
                    if (!(e instanceof ModalCancelledError)) {
                        console.error('GalleryFlow: crop modal error (existing image)', e);
                    }
                    // Cancelled - re-open gallery modal
                    return this.#run(this.#galleryModal.config.tabs);
                }
            } else {
                // Not croppable - hide and apply directly
                await this.#galleryModal.hide();
                await this.#apply(id, category);
            }
        } else {
            // No image object (e.g. preset with just ID) - hide and apply
            await this.#galleryModal.hide();
            await this.#apply(id, category);
        }
    }

    async #handleUpload(file, category) {
        const normalizedCategory = this.#deps.categoryUtils.normalize(category);

        if (ImageUtils.isCroppable(file)) {
            // Mark as transition to prevent the galleryModal's open() from rejecting with an error
            this.#galleryModal.submit({ type: 'transition' });
            
            // Hide gallery before showing crop modal
            await this.#galleryModal.hide();
            
            try {
                console.log('GalleryFlow: opening crop modal for file', file);
                this.#cropModal = new CropModal(this.#deps);
                const result = await this.#cropModal.show(file);
                console.log('GalleryFlow: crop modal result', result);
                let finalId;
                if (result.mode === 'no-crop') {
                    // If it's a new upload and "Don't crop" is chosen, we still need to save it to the repository
                    const newImage = await this.#deps.imageService.saveUpload(file, normalizedCategory);
                    finalId = newImage.id;
                } else {
                    const newImage = await this.#deps.imageService.saveUpload(result.blob, normalizedCategory);
                    finalId = newImage.id;
                }
                await this.#apply(finalId, normalizedCategory);
            } catch (e) {
                if (!(e instanceof ModalCancelledError)) {
                    console.error('GalleryFlow: crop modal error', e);
                }
                // Cancelled - re-open gallery modal
                await this.#run(this.#galleryModal.config.tabs);
            }
        } else {
            // Not croppable - save upload and apply directly
            this.#galleryModal.submit({ type: 'transition' });
            await this.#galleryModal.hide();
            const newImage = await this.#deps.imageService.saveUpload(file, normalizedCategory);
            await this.#apply(newImage.id, normalizedCategory);
        }
    }

    async #apply(id, category) {
        if (this.#onApply) {
            await this.#onApply({ id, category, target: this.#target });
        }
    }
}
