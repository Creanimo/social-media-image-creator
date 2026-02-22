import Mustache from 'mustache';

export class EditorView {
    #container;
    #sidebarContainer;
    #template;
    #sidebarTemplate;
    #modalTemplate;
    #canvasTemplate;
    #urlManager;
    #preferences;

    constructor(container, sidebarContainer, urlManager, preferences) {
        this.#container = container;
        this.#sidebarContainer = sidebarContainer;
        this.#template = null;
        this.#sidebarTemplate = null;
        this.#modalTemplate = null;
        this.#canvasTemplate = null;
        this.#urlManager = urlManager;
        this.#preferences = preferences;
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
     * @param {Array} data.presetBackgrounds
     * @param {Array} data.fontStyles
     * @param {Array} data.fontStyleUrls
     */
    render(creation, { presets = [], bgSrc = null, galleryImages = [], presetBackgrounds = [], fontStyles = [], fontStyleUrls = [] } = {}) {
        const viewData = this.#prepareViewData(creation, { presets, bgSrc, presetBackgrounds, fontStyles, fontStyleUrls });

        const renderedMain = Mustache.render(this.#template, viewData);
        this.#container.innerHTML = renderedMain;

        this.renderCanvas(creation, { presets, bgSrc, fontStyles, fontStyleUrls });

        const renderedSidebar = Mustache.render(this.#sidebarTemplate, viewData);
        this.#sidebarContainer.innerHTML = renderedSidebar;

        // Render modal if requested
        if (galleryImages.length >= 0) {
            this.renderGalleryModal(galleryImages, presetBackgrounds);
        }
    }

    /**
     * Renders only the canvas/iframe content.
     */
    renderCanvas(creation, { presets = [], bgSrc = null, fontStyles = [], fontStyleUrls = [] } = {}) {
        // Save current zoom if frame exists
        let currentZoom = null;
        const oldFrame = this.#container.querySelector('wa-zoomable-frame');
        if (oldFrame) {
            currentZoom = oldFrame.zoom;
        }

        const viewData = this.#prepareViewData(creation, { presets, bgSrc, fontStyles, fontStyleUrls });
        const canvasHtml = Mustache.render(this.#canvasTemplate, viewData);

        // Set srcdoc directly to avoid attribute escaping issues
        const zoomableFrame = this.#container.querySelector('wa-zoomable-frame');
        if (zoomableFrame) {
            zoomableFrame.srcdoc = canvasHtml;
            // Restore zoom
            if (currentZoom !== null) {
                zoomableFrame.zoom = currentZoom;
            } else {
                // Check preferences for a saved zoom preference
                const savedZoom = this.#preferences.get('editor-zoom');
                if (savedZoom) {
                    zoomableFrame.zoom = parseFloat(savedZoom);
                }
            }

            // Listen for zoom changes to persist it
            zoomableFrame.addEventListener('wa-zoom-change', (e) => {
                this.#preferences.set('editor-zoom', e.target.zoom);
            });
        }
    }

    #prepareViewData(creation, { presets = [], bgSrc = null, presetBackgrounds = [], fontStyles = [], fontStyleUrls = [] } = {}) {
        const slotIds = [
            'top-left', 'top-middle', 'top-right',
            'center-left', 'center-middle', 'center-right',
            'bottom-left', 'bottom-middle', 'bottom-right'
        ];

        const layersWithMeta = creation ? creation.layers.map((layer, index) => ({
            ...layer,
            index,
            isFont: layer.type === 'font'
        })) : [];

        const slots = slotIds.map(id => ({
            id,
            layers: layersWithMeta.filter(l => l.slot === id)
        }));

        return {
            creation: creation ? {
                ...creation,
                backgroundScalePercent: creation.backgroundScale * 100,
                layers: layersWithMeta
            } : null,
            slots,
            presets,
            bgSrc: bgSrc || 'none',
            currentPresetName: presets.find(p => p.width === creation?.width && p.height === creation?.height)?.name,
            presetBackgrounds,
            fontStyles,
            fontStyleUrls
        };
    }

    /**
     * @param {Array} images 
     * @param {Array} presetBackgrounds
     */
    renderGalleryModal(images, presetBackgrounds = []) {
        const modalContainer = this.#container.querySelector('#modal-container');
        if (!modalContainer) return;

        // Manage URLs for modal images using central URL manager
        const mappedImages = images.map(img => ({
            id: img.id,
            src: this.#urlManager.getUrl(img.id, img.imageBlob)
        }));

        const renderedModal = Mustache.render(this.#modalTemplate, { 
            images: mappedImages,
            presetBackgrounds
        });
        modalContainer.innerHTML = renderedModal;
    }

    get container() {
        return this.#container;
    }

    get sidebarContainer() {
        return this.#sidebarContainer;
    }
}
