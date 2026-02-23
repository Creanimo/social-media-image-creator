import Mustache from 'mustache';

export class EditorView {
    #container;
    #sidebarContainer;
    #template;
    #sidebarTemplate;
    #sidebarGeneralTemplate;
    #sidebarBackgroundTemplate;
    #sidebarLayersTemplate;
    #layerFontTemplate;
    #layerIconTemplate;
    #layerIconCalloutTemplate;
    #layerImageTemplate;
    #canvasTemplate;
    #canvasLayerFontTemplate;
    #canvasLayerIconTemplate;
    #canvasLayerIconCalloutTemplate;
    #canvasLayerImageTemplate;
    #imageCardTemplate;
    #iconPickerTemplate;
    #colorPickerTemplate;
    #modalTemplate;
    #addLayerModalTemplate;
    #urlManager;
    #preferences;

    constructor(container, sidebarContainer, urlManager, preferences) {
        this.#container = container;
        this.#sidebarContainer = sidebarContainer;
        this.#template = null;
        this.#sidebarTemplate = null;
        this.#modalTemplate = null;
        this.#addLayerModalTemplate = null;
        this.#canvasTemplate = null;
        this.#sidebarGeneralTemplate = null;
        this.#sidebarBackgroundTemplate = null;
        this.#sidebarLayersTemplate = null;
        this.#layerFontTemplate = null;
        this.#layerIconTemplate = null;
        this.#layerIconCalloutTemplate = null;
        this.#layerImageTemplate = null;
        this.#canvasLayerFontTemplate = null;
        this.#canvasLayerIconTemplate = null;
        this.#canvasLayerIconCalloutTemplate = null;
        this.#canvasLayerImageTemplate = null;
        this.#imageCardTemplate = null;
        this.#iconPickerTemplate = null;
        this.#urlManager = urlManager;
        this.#preferences = preferences;
    }

    async loadTemplates() {
        const [editorRes, sidebarRes, sidebarGeneralRes, sidebarBackgroundRes, sidebarLayersRes, layerFontRes, layerIconRes, layerIconCalloutRes, layerImageRes, imageCardRes, iconPickerRes, colorPickerRes, modalRes, addLayerModalRes, canvasRes, canvasLayerFontRes, canvasLayerIconRes, canvasLayerIconCalloutRes, canvasLayerImageRes] = await Promise.all([
            fetch('view/templates/editor.mustache'),
            fetch('view/templates/editor-sidebar.mustache'),
            fetch('view/templates/editor-sidebar-general.mustache'),
            fetch('view/templates/editor-sidebar-background.mustache'),
            fetch('view/templates/editor-sidebar-layers.mustache'),
            fetch('view/templates/editor-sidebar-layer-font.mustache'),
            fetch('view/templates/editor-sidebar-layer-icon.mustache'),
            fetch('view/templates/editor-sidebar-layer-icon-callout.mustache'),
            fetch('view/templates/editor-sidebar-layer-image.mustache'),
            fetch('view/templates/image-card.mustache'),
            fetch('view/templates/icon-picker.mustache'),
            fetch('view/templates/color-picker.mustache'),
            fetch('view/templates/gallery-modal.mustache'),
            fetch('view/templates/add-layer-modal.mustache'),
            fetch('view/templates/canvas.mustache'),
            fetch('view/templates/canvas-layer-font.mustache'),
            fetch('view/templates/canvas-layer-icon.mustache'),
            fetch('view/templates/canvas-layer-icon-callout.mustache'),
            fetch('view/templates/canvas-layer-image.mustache')
        ]);
        this.#template = await editorRes.text();
        this.#sidebarTemplate = await sidebarRes.text();
        this.#sidebarGeneralTemplate = await sidebarGeneralRes.text();
        this.#sidebarBackgroundTemplate = await sidebarBackgroundRes.text();
        this.#sidebarLayersTemplate = await sidebarLayersRes.text();
        this.#layerFontTemplate = await layerFontRes.text();
        this.#layerIconTemplate = await layerIconRes.text();
        this.#layerIconCalloutTemplate = await layerIconCalloutRes.text();
        this.#layerImageTemplate = await layerImageRes.text();
        this.#imageCardTemplate = await imageCardRes.text();
        this.#iconPickerTemplate = await iconPickerRes.text();
        this.#colorPickerTemplate = await colorPickerRes.text();
        this.#modalTemplate = await modalRes.text();
        this.#addLayerModalTemplate = await addLayerModalRes.text();
        this.#canvasTemplate = await canvasRes.text();
        this.#canvasLayerFontTemplate = await canvasLayerFontRes.text();
        this.#canvasLayerIconTemplate = await canvasLayerIconRes.text();
        this.#canvasLayerIconCalloutTemplate = await canvasLayerIconCalloutRes.text();
        this.#canvasLayerImageTemplate = await canvasLayerImageRes.text();
    }

    /**
     * @param {Creation|null} creation 
     * @param {Object} data 
     * @param {Array} data.presets
     * @param {string} data.bgSrc
     * @param {Array} data.uploadedImages
     * @param {Array} data.presetBackgrounds
     * @param {Array} data.fontStyles
     * @param {Array} data.fontStyleUrls
     * @param {Array} data.calloutStyles
     * @param {Array} data.calloutStyleUrls
     */
    render(creation, { presets = [], bgSrc = null, uploadedImages = [], presetBackgrounds = [], allImages = [], fontStyles = [], fontStyleUrls = [], calloutStyles = [], calloutStyleUrls = [] } = {}) {
        const viewData = this.#prepareViewData(creation, { presets, bgSrc, presetBackgrounds, allImages, fontStyles, fontStyleUrls, calloutStyles, calloutStyleUrls });

        const renderedMain = Mustache.render(this.#template, viewData);
        this.#container.innerHTML = renderedMain;

        this.renderCanvas(creation, { presets, bgSrc, allImages, fontStyles, fontStyleUrls, calloutStyles, calloutStyleUrls });

        const partials = {
            'editor-sidebar-general': this.#sidebarGeneralTemplate,
            'editor-sidebar-background': this.#sidebarBackgroundTemplate,
            'editor-sidebar-layers': this.#sidebarLayersTemplate,
            'layer-font': this.#layerFontTemplate,
            'layer-icon': this.#layerIconTemplate,
            'layer-icon-callout': this.#layerIconCalloutTemplate,
            'layer-image': this.#layerImageTemplate,
            'icon-picker': this.#iconPickerTemplate,
            'color-picker': this.#colorPickerTemplate
        };

        const renderedSidebar = Mustache.render(this.#sidebarTemplate, viewData, partials);
        this.#sidebarContainer.innerHTML = renderedSidebar;

        // Render modal if requested
        if (uploadedImages.length >= 0) {
            this.renderGalleryModal(uploadedImages, presetBackgrounds);
            this.renderAddLayerModal();
        }
    }

    /**
     * Renders only the canvas/iframe content.
     */
    renderCanvas(creation, { presets = [], bgSrc = null, allImages = [], fontStyles = [], fontStyleUrls = [], calloutStyles = [], calloutStyleUrls = [] } = {}) {
        // Save current zoom if frame exists
        let currentZoom = null;
        const oldFrame = this.#container.querySelector('wa-zoomable-frame');
        if (oldFrame) {
            currentZoom = oldFrame.zoom;
        }

        const viewData = this.#prepareViewData(creation, { presets, bgSrc, allImages, fontStyles, fontStyleUrls, calloutStyles, calloutStyleUrls });
        const partials = {
            'canvas-layer-font': this.#canvasLayerFontTemplate,
            'canvas-layer-icon': this.#canvasLayerIconTemplate,
            'canvas-layer-icon-callout': this.#canvasLayerIconCalloutTemplate,
            'canvas-layer-image': this.#canvasLayerImageTemplate
        };
        const canvasHtml = Mustache.render(this.#canvasTemplate, viewData, partials);

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

    #prepareViewData(creation, { presets = [], bgSrc = null, presetBackgrounds = [], allImages = [], fontStyles = [], fontStyleUrls = [], calloutStyles = [], calloutStyleUrls = [] } = {}) {
        const slotIds = [
            'top-left', 'top-middle', 'top-right',
            'center-left', 'center-middle', 'center-right',
            'bottom-left', 'bottom-middle', 'bottom-right'
        ];

        const layersWithMeta = creation ? creation.layers.map((layer, index) => {
            let src = null;
            if (layer.type === 'image' && layer.imageId) {
                const img = allImages.find(i => i.id === layer.imageId);
                if (img) {
                    src = this.#urlManager.getUrl(img.id, img.imageBlob);
                }
            }
            return {
                ...layer,
                index,
                isFont: layer.type === 'font',
                isIcon: layer.type === 'icon',
                isIconCallout: layer.type === 'icon-callout',
                isImage: layer.type === 'image',
                src
            };
        }) : [];

        const layersWithMovement = layersWithMeta.map(layer => {
            const slotLayers = layersWithMeta.filter(l => l.slot === layer.slot);
            const indexInSlot = slotLayers.findIndex(l => l.index === layer.index);
            const sortedLayers = [...layersWithMeta].sort((a, b) => a.zIndex - b.zIndex);
            const maxZ = sortedLayers.length > 0 ? sortedLayers[sortedLayers.length - 1].zIndex : 0;
            const minZ = sortedLayers.length > 0 ? sortedLayers[0].zIndex : 0;

            return {
                ...layer,
                canMoveUp: indexInSlot > 0,
                canMoveDown: indexInSlot < slotLayers.length - 1,
                hasMultipleInSlot: slotLayers.length > 1,
                isAtFront: layer.zIndex === maxZ && sortedLayers.length > 1,
                isAtBack: layer.zIndex === minZ && sortedLayers.length > 1
            };
        });

        const slots = slotIds.map(id => ({
            id,
            layers: layersWithMovement.filter(l => l.slot === id)
        }));

        const filledSlots = slots.filter(s => s.layers.length > 0).map((s, idx, arr) => ({
            ...s,
            isLast: idx === arr.length - 1
        }));

        return {
            creation: creation ? {
                ...creation,
                backgroundScalePercent: creation.backgroundScale * 100,
                layers: layersWithMovement,
                widthTimesTwo: creation.width * 2
            } : null,
            slots,
            filledSlots,
            presets,
            bgSrc: bgSrc || 'none',
            currentPresetName: presets.find(p => p.width === creation?.width && p.height === creation?.height)?.name,
            presetBackgrounds,
            fontStyles,
            fontStyleUrls,
            calloutStyles,
            calloutStyleUrls
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
            src: this.#urlManager.getUrl(img.id, img.imageBlob),
            category: img.category,
            source: 'my-uploads',
            isBackground: img.category === 'background',
            isImage: img.category === 'image',
            isModal: true
        }));

        const mappedPresets = presetBackgrounds.map(bg => ({
            ...bg,
            src: this.#urlManager.getUrl(bg.id, bg.imageBlob),
            category: 'background',
            source: 'pre-made',
            isBackground: true,
            isModal: true
        }));

        const renderedModal = Mustache.render(this.#modalTemplate, { 
            images: [...mappedImages, ...mappedPresets]
        }, {
            'image-card': this.#imageCardTemplate
        });
        
        // Use single wrapper and overwrite content to avoid duplicate modals in DOM
        let wrapper = modalContainer.querySelector('#gallery-modal-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.id = 'gallery-modal-wrapper';
            modalContainer.appendChild(wrapper);
        }
        wrapper.innerHTML = renderedModal;
    }

    /**
     * Renders the add layer modal.
     */
    renderAddLayerModal() {
        const modalContainer = this.#container.querySelector('#modal-container');
        if (!modalContainer) return;

        const renderedModal = Mustache.render(this.#addLayerModalTemplate, {});
        
        let wrapper = modalContainer.querySelector('#add-layer-modal-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.id = 'add-layer-modal-wrapper';
            modalContainer.appendChild(wrapper);
        }
        wrapper.innerHTML = renderedModal;
    }

    get colorPickerTemplate() {
        return this.#colorPickerTemplate;
    }

    /**
     * @returns {HTMLIFrameElement|null}
     */
    getCanvasIframe() {
        let iframe = this.#container.querySelector('iframe');
        if (!iframe) {
            const zoomableFrame = this.#container.querySelector('wa-zoomable-frame');
            if (zoomableFrame && zoomableFrame.shadowRoot) {
                iframe = zoomableFrame.shadowRoot.querySelector('iframe');
            }
        }
        return iframe;
    }

    get container() {
        return this.#container;
    }

    get sidebarContainer() {
        return this.#sidebarContainer;
    }
}
