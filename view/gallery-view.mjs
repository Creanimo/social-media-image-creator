import Mustache from 'mustache';

/**
 * View for the image gallery.
 * Handles rendering logic and DOM updates.
 */
export class GalleryView {
    #container;
    #template;
    #cardTemplate;
    #urlManager;

    /**
     * @param {HTMLElement} container
     * @param {ImageUrlManager} urlManager
     */
    constructor(container, urlManager) {
        this.#container = container;
        this.#template = null;
        this.#cardTemplate = null;
        this.#urlManager = urlManager;
    }

    /**
     * Loads the templates.
     */
    async loadTemplates() {
        const [galleryRes, cardRes] = await Promise.all([
            fetch('view/templates/gallery.mustache'),
            fetch('view/templates/image-card.mustache')
        ]);
        this.#template = await galleryRes.text();
        this.#cardTemplate = await cardRes.text();
    }

    /**
     * Renders the gallery with the provided image data.
     * @param {Image[]} images
     */
    render(images) {
        // Use ImageUrlManager to handle URLs and avoid memory leaks
        // Revoke URLs for images that are no longer in the list
        this.#urlManager.revokeExcept(images.map(img => img.id));

        const imageData = images.map(img => ({
            id: img.id,
            src: this.#urlManager.getUrl(img.id, img.imageBlob)
        }));

        const rendered = Mustache.render(this.#template, { images: imageData }, {
            'image-card': this.#cardTemplate
        });
        this.#container.innerHTML = rendered;
    }

    /**
     * @returns {HTMLElement}
     */
    get container() {
        return this.#container;
    }
}
