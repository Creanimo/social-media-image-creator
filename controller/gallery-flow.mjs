/**
 * Controller/Orchestrator for gallery interactions within modals.
 */
export class GalleryFlow {
    #deps;
    #modal;
    #gallery;
    #target;
    #onApply;

    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} modal - The wa-dialog element
     */
    constructor(deps, modal) {
        this.#deps = deps;
        this.#modal = modal;
    }

    /**
     * Opens the gallery modal.
     * @param {string[]} tabs - List of tab IDs
     * @param {'background'|'layer'} target - Application target
     * @param {Function} onApply - Callback function called with { id, category, target }
     */
    async open(tabs, target, onApply) {
        this.#target = target;
        this.#onApply = onApply;

        const galleryContainer = this.#modal.querySelector('#gallery-component-container');
        
        // Always create a new component to ensure fresh config/handlers
        this.#gallery = new GalleryComponent(galleryContainer, this.#deps, {
            tabs: tabs,
            isModal: true,
            onSelect: (id, tabId) => this.#handleSelect(id, tabId),
            onUpload: (file, category) => this.#handleUpload(file, category)
        });

        await this.#gallery.loadTemplates();
        await this.refresh();
        this.#modal.show();
    }

    /**
     * Refreshes the gallery data.
     */
    async refresh() {
        if (!this.#gallery) return;

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
    }

    async #handleSelect(id, tabId) {
        const category = this.#deps.categoryUtils.normalize(tabId);
        await this.#apply(id, category);
    }

    async #handleUpload(file, category) {
        const normalizedCategory = this.#deps.categoryUtils.normalize(category);
        const newImage = await this.#deps.imageService.saveUpload(file, normalizedCategory);
        await this.#apply(newImage.id, normalizedCategory);
    }

    async #apply(id, category) {
        this.#modal.open = false;
        if (this.#onApply) {
            await this.#onApply({ id, category, target: this.#target });
        }
    }
}
