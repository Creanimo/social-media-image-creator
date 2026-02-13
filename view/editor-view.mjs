import Mustache from 'mustache';

export class EditorView {
    #container;
    #sidebarContainer;
    #template;
    #sidebarTemplate;
    #modalTemplate;
    #canvasTemplate;
    #urlManager;

    constructor(container, sidebarContainer, urlManager) {
        this.#container = container;
        this.#sidebarContainer = sidebarContainer;
        this.#template = null;
        this.#sidebarTemplate = null;
        this.#modalTemplate = null;
        this.#canvasTemplate = null;
        this.#urlManager = urlManager;
    }

    async loadTemplates() {
        const [editorRes, sidebarRes, modalRes, canvasRes] = await Promise.all([
            fetch('view/templates/editor.mustache'),
            fetch('view/templates/editor-sidebar.mustache'),
            fetch('view/templates/gallery-modal.mustache'),
            fetch('view/templates/canvas.mustache')
        ]);
        this.#template = await editorRes.text();
        this.#sidebarTemplate = await sidebarRes.text();
        this.#modalTemplate = await modalRes.text();
        this.#canvasTemplate = await canvasRes.text();
    }

    /**
     * @param {Creation|null} creation 
     * @param {Object} data 
     * @param {Array} data.presets
     * @param {string} data.bgSrc
     * @param {Array} data.galleryImages
     */
    render(creation, { presets = [], bgSrc = null, galleryImages = [] } = {}) {
        const viewData = {
            creation,
            presets,
            bgSrc: bgSrc || 'none',
            currentPresetName: presets.find(p => p.width === creation?.width && p.height === creation?.height)?.name
        };

        const canvasHtml = Mustache.render(this.#canvasTemplate, viewData);

        const renderedMain = Mustache.render(this.#template, viewData);
        this.#container.innerHTML = renderedMain;

        // Set srcdoc directly to avoid attribute escaping issues
        const zoomableFrame = this.#container.querySelector('wa-zoomable-frame');
        if (zoomableFrame) {
            zoomableFrame.srcdoc = canvasHtml;
        }

        const renderedSidebar = Mustache.render(this.#sidebarTemplate, viewData);
        this.#sidebarContainer.innerHTML = renderedSidebar;

        // Render modal if requested
        if (galleryImages.length >= 0) {
            this.renderGalleryModal(galleryImages);
        }
    }

    /**
     * @param {Array} images 
     */
    renderGalleryModal(images) {
        const modalContainer = this.#container.querySelector('#modal-container');
        if (!modalContainer) return;

        // Manage URLs for modal images using central URL manager
        const mappedImages = images.map(img => ({
            id: img.id,
            src: this.#urlManager.getUrl(img.id, img.imageBlob)
        }));

        const renderedModal = Mustache.render(this.#modalTemplate, { images: mappedImages });
        modalContainer.innerHTML = renderedModal;
    }

    get container() {
        return this.#container;
    }

    get sidebarContainer() {
        return this.#sidebarContainer;
    }
}
