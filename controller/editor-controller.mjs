import { EditorView } from '../view/editor-view.mjs';
import { Image } from '../model/image.mjs';
import { Creation } from '../model/creation.mjs';
import { FontLayer } from '../model/font-layer.mjs';
import { IconLayer } from '../model/icon-layer.mjs';
import { FontStyleController } from './font-style-controller.mjs';
import { IconPickerController } from './icon-picker-controller.mjs';
import { IconPickerView } from '../view/icon-picker-view.mjs';
import { ColorPickerController } from './color-picker-controller.mjs';
import { ColorPickerView } from '../view/color-picker-view.mjs';

import { LivePreviewPipeline } from './live-preview-pipeline.mjs';

export class EditorController {
    #deps;
    #view;
    #currentCreation;
    #presets;
    #fontStyleController;

    constructor(deps, container, sidebarContainer) {
        this.#deps = deps;
        this.#view = new EditorView(container, sidebarContainer, deps.imageUrlManager, deps.preferences);
        this.#currentCreation = null;
        this.#presets = [];
        this.#fontStyleController = new FontStyleController();
    }

    async init() {
        // Load presets
        const [presetsRes, fontStylesRes] = await Promise.all([
            fetch('presets/image-sizes.json'),
            this.#fontStyleController.init()
        ]);
        const data = await presetsRes.json();
        this.#presets = data['image-sizes'];

        await this.#view.loadTemplates();
        await this.refresh();
    }

    async refresh() {
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const id = urlParams.get('id');

        if (id) {
            this.#currentCreation = await this.#deps.creationRepository.get(id, this.#deps);
        } else {
            // Create a new blank creation if none is selected
            const response = await fetch('presets/template-creations/default.json');
            const defaultData = await response.json();
            this.#currentCreation = new Creation(
                null,
                defaultData,
                this.#deps
            );
            // Save it so it has an ID and we can add a background to it
            await this.#deps.creationRepository.save(this.#currentCreation);
            // Update URL to include the new ID
            window.location.hash = `#editor?id=${this.#currentCreation.id}`;
            return; // refresh() will be called again due to hash change
        }

        await this.#updateView();
    }

    async #updateView(fullRefresh = true) {
        let bgSrc = null;
        if (this.#currentCreation?.backgroundImageId) {
            let img = await this.#deps.imageRepository.get(this.#currentCreation.backgroundImageId, this.#deps);
            if (!img) {
                img = await this.#deps.backgroundRepository.get(this.#currentCreation.backgroundImageId);
            }
            if (img) {
                bgSrc = this.#deps.imageUrlManager.getUrl(img.id, img.imageBlob);
            }
        }

        const galleryImages = await this.#deps.imageRepository.getAll(this.#deps);
        const presetBackgrounds = await this.#deps.backgroundRepository.getAll();
        
        const renderData = {
            presets: this.#presets,
            bgSrc,
            galleryImages,
            presetBackgrounds: presetBackgrounds.map(bg => ({
                ...bg,
                src: this.#deps.imageUrlManager.getUrl(bg.id, bg.imageBlob)
            })),
            fontStyles: this.#fontStyleController.getStyles(),
            fontStyleUrls: this.#fontStyleController.getUrls()
        };

        if (fullRefresh) {
            this.#view.render(this.#currentCreation, renderData);
            this.#bindEvents();
        } else {
            this.#view.renderCanvas(this.#currentCreation, renderData);
        }
    }

    #bindEvents() {
        const container = this.#view.container;
        const sidebar = this.#view.sidebarContainer;
        const form = sidebar.querySelector('#editor-settings-form');

        const getIframe = () => {
            let iframe = container.querySelector('iframe');
            if (!iframe) {
                const zoomableFrame = container.querySelector('wa-zoomable-frame');
                if (zoomableFrame && zoomableFrame.shadowRoot) {
                    iframe = zoomableFrame.shadowRoot.querySelector('iframe');
                }
            }
            return iframe;
        };

        // Form submission / Auto-save
        const submitForm = async (options = {}) => {
            if (!form || !this.#currentCreation) {
                console.warn('[EditorController] submitForm aborted: form or currentCreation missing');
                return;
            }

            // Extract values directly from elements to be safe with custom elements
            const titleInput = sidebar.querySelector('wa-input[name="title"]');
            const widthInput = sidebar.querySelector('wa-input[name="width"]');
            const heightInput = sidebar.querySelector('wa-input[name="height"]');
            const bgIdInput = sidebar.querySelector('input[name="backgroundImageId"]');
            const scaleSlider = sidebar.querySelector('wa-slider[name="backgroundScale"]');
            const xSlider = sidebar.querySelector('wa-slider[name="backgroundX"]');
            const ySlider = sidebar.querySelector('wa-slider[name="backgroundY"]');

            // Use .value which is the getter for WebAwesome components
            const titleValue = titleInput ? titleInput.value : '';
            const widthValue = widthInput ? widthInput.value : '';
            const heightValue = heightInput ? heightInput.value : '';
            const backgroundImageId = bgIdInput ? bgIdInput.value : '';
            const backgroundScale = scaleSlider ? parseFloat(scaleSlider.value) : 1.0;
            const backgroundX = xSlider ? parseInt(xSlider.value) : 0;
            const backgroundY = ySlider ? parseInt(ySlider.value) : 0;

            // Handle Layers
            const updatedLayers = this.#currentCreation.layers.map((layer, index) => {
                const nameValue = sidebar.querySelector(`wa-input[name="layer-${index}-name"]`)?.value;
                let updatedLayer = layer;
                if (nameValue !== undefined && nameValue !== layer.name) {
                    updatedLayer = updatedLayer.withName(nameValue);
                }

                if (updatedLayer instanceof FontLayer) {
                    const fontText = sidebar.querySelector(`wa-textarea[name="layer-${index}-text"]`)?.value || '';
                    const html = fontText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
                    
                    const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
                    const styleIdValue = sidebar.querySelector(`wa-select[name="layer-${index}-styleId"]`)?.value;
                    const sizeInput = sidebar.querySelector(`wa-input[name="layer-${index}-size"]`);
                    const sizeValue = sizeInput && sizeInput.value !== '' ? parseInt(sizeInput.value) : null;
                    const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
                    const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);
                    
                    let updatedLayerFinal = updatedLayer;
                    if (slotValue !== undefined) updatedLayerFinal = updatedLayerFinal.withSlot(slotValue);
                    if (styleIdValue !== undefined) updatedLayerFinal = updatedLayerFinal.withStyleId(styleIdValue);
                    if (fontText !== undefined) updatedLayerFinal = updatedLayerFinal.withText(fontText).withHtml(html);
                    if (sizeValue !== undefined) updatedLayerFinal = updatedLayerFinal.withSize(sizeValue);
                    if (!isNaN(offsetXValue)) updatedLayerFinal = updatedLayerFinal.withOffsetX(offsetXValue);
                    if (!isNaN(offsetYValue)) updatedLayerFinal = updatedLayerFinal.withOffsetY(offsetYValue);
                    
                    return updatedLayerFinal;
                }
                
                if (updatedLayer instanceof IconLayer) {
                    const iconValue = sidebar.querySelector(`input[name="layer-${index}-icon"]`)?.value || 'photo';
                    const colorValue = sidebar.querySelector(`input[name="layer-${index}-color"]`)?.value || '#000000';
                    const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
                    const sizeInput = sidebar.querySelector(`wa-input[name="layer-${index}-size"]`);
                    const sizeValue = sizeInput && sizeInput.value !== '' ? parseInt(sizeInput.value) : null;
                    const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
                    const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);

                    let updatedLayerFinal = updatedLayer;
                    if (slotValue !== undefined) updatedLayerFinal = updatedLayerFinal.withSlot(slotValue);
                    if (iconValue !== undefined) updatedLayerFinal = updatedLayerFinal.withIcon(iconValue);
                    if (colorValue !== undefined) updatedLayerFinal = updatedLayerFinal.withColor(colorValue);
                    if (sizeValue !== undefined) updatedLayerFinal = updatedLayerFinal.withSize(sizeValue);
                    if (!isNaN(offsetXValue)) updatedLayerFinal = updatedLayerFinal.withOffsetX(offsetXValue);
                    if (!isNaN(offsetYValue)) updatedLayerFinal = updatedLayerFinal.withOffsetY(offsetYValue);

                    return updatedLayerFinal;
                }
                return updatedLayer;
            });

            const width = parseInt(widthValue);
            const height = parseInt(heightValue);

            // Map form data to creation
            let updatedCreation = this.#currentCreation;

            if (titleValue !== undefined) {
                updatedCreation = updatedCreation.withTitle(titleValue);
            }
            if (!isNaN(width) && width > 0) {
                updatedCreation = updatedCreation.withWidth(width);
            }
            if (!isNaN(height) && height > 0) {
                updatedCreation = updatedCreation.withHeight(height);
            }
            if (backgroundImageId !== undefined) {
                updatedCreation = updatedCreation.withBackgroundImageId(backgroundImageId);
            }
            if (!isNaN(backgroundScale)) {
                updatedCreation = updatedCreation.withBackgroundScale(backgroundScale);
            }
            if (!isNaN(backgroundX)) {
                updatedCreation = updatedCreation.withBackgroundX(backgroundX);
            }
            if (!isNaN(backgroundY)) {
                updatedCreation = updatedCreation.withBackgroundY(backgroundY);
            }

            // Update layers
            updatedCreation = updatedCreation.withLayers(updatedLayers);

            if (updatedCreation !== this.#currentCreation) {
                const structuralChange = updatedCreation.layers.length !== this.#currentCreation.layers.length;
                this.#currentCreation = updatedCreation;
                await this.#deps.creationRepository.save(this.#currentCreation);
                
                // If this was a slider change, we don't want to re-render the canvas because it was already updated live
                const skipRender = options.skipRender || false;
                if (!skipRender) {
                    await this.#updateView(structuralChange);
                }
            }
        };

        // Listen for changes in the form
        const formElements = form?.querySelectorAll('wa-input, wa-select, wa-slider, wa-textarea') || [];
        formElements.forEach(el => {
            // Use standard 'change' event as 'wa-change' is not emitted by the components
            el.addEventListener('change', () => {
                const isSlider = el.tagName === 'WA-SLIDER';
                submitForm({ skipRender: isSlider });
            });

            // Use 'input' event for sliders to have live preview during dragging
            if (el.tagName === 'WA-SLIDER') {
                const liveUpdateHandler = (e) => {
                    const pipeline = new LivePreviewPipeline(getIframe(), sidebar);
                    pipeline.sendUpdate(e.target.name, e.target.value);
                };

                el.addEventListener('input', liveUpdateHandler);
            }

            if (el.tagName === 'WA-INPUT' || el.tagName === 'WA-TEXTAREA') {
                // Also trigger on blur for immediate feedback after typing
                el.addEventListener('blur', () => {
                    const isSizeInput = el.name.includes('-size');
                    const isNameInput = el.name.includes('-name');
                    submitForm({ skipRender: isSizeInput || isNameInput });
                });
                
                // For regular inputs, input is also useful for real-time
                if (el.tagName === 'WA-INPUT' && el.name.includes('-size')) {
                     const liveSizeHandler = (e) => {
                         const pipeline = new LivePreviewPipeline(getIframe(), sidebar);
                         pipeline.sendUpdate(e.target.name, e.target.value);
                     };
                     el.addEventListener('input', liveSizeHandler);
                }
            }
        });

        // Setup Icon Pickers
        this.#currentCreation?.layers.forEach((layer, index) => {
            if (layer instanceof IconLayer) {
                const iconPickerContainer = sidebar.querySelector(`#icon-picker-container-${index}`);
                if (iconPickerContainer) {
                    const iconPickerView = new IconPickerView(iconPickerContainer);
                    const iconPickerController = new IconPickerController(iconPickerView, `layer-${index}`, (newValue) => {
                        submitForm();
                    });
                    iconPickerController.init({
                        name: `layer-${index}-icon`,
                        value: layer.icon,
                        label: 'Icon'
                    });
                }

                const colorPickerContainer = sidebar.querySelector(`#color-picker-container-${index}`);
                if (colorPickerContainer) {
                    const colorPickerView = new ColorPickerView(colorPickerContainer, this.#view.colorPickerTemplate);
                    const colorPickerController = new ColorPickerController(colorPickerView, async (newValue, isLive = false) => {
                        const pipeline = new LivePreviewPipeline(getIframe(), sidebar);
                        pipeline.sendUpdate(`layer-${index}-color`, newValue);
                        await submitForm({skipRender: true});
                    });
                    colorPickerController.init({
                        name: `layer-${index}-color`,
                        value: layer.color,
                        label: 'Icon Color',
                        noFullPicker: true
                    });
                }
            }
        });

        // Setup slider value formatters
        const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent' });

        customElements.whenDefined('wa-slider').then(() => {
            sidebar.querySelectorAll('wa-slider').forEach(slider => {
                if (slider.id === 'slider-bg-scale') {
                    slider.valueFormatter = value => percentFormatter.format(value);
                } else {
                    slider.valueFormatter = value => `${value}px`;
                }
            });
        });

        // Add Layer Modal Open
        sidebar.querySelector('#add-layer-btn')?.addEventListener('click', () => {
            const modal = container.querySelector('#add-layer-modal');
            modal?.show();
        });

        // Add Layer from Modal
        const addLayerModal = container.querySelector('#add-layer-modal');
        addLayerModal?.querySelectorAll('.add-layer-type-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const type = btn.getAttribute('data-type');
                if (type === 'font') {
                    const response = await fetch('presets/layers/font.json');
                    const data = await response.json();
                    const newLayer = new FontLayer(null, data, this.#deps);
                    this.#currentCreation = this.#currentCreation.addLayer(newLayer);
                    await this.#deps.creationRepository.save(this.#currentCreation);
                    addLayerModal.open = false;
                    await this.#updateView();
                } else if (type === 'icon') {
                    const response = await fetch('presets/layers/icon.json');
                    const data = await response.json();
                    const newLayer = new IconLayer(null, data, this.#deps);
                    this.#currentCreation = this.#currentCreation.addLayer(newLayer);
                    await this.#deps.creationRepository.save(this.#currentCreation);
                    addLayerModal.open = false;
                    await this.#updateView();
                }
            });
        });

        addLayerModal?.querySelector('#close-add-layer-modal')?.addEventListener('click', () => addLayerModal.open = false);

        // Remove Layer
        sidebar.querySelectorAll('.remove-layer-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const index = parseInt(btn.getAttribute('data-index'));
                const newLayers = [...this.#currentCreation.layers];
                newLayers.splice(index, 1);
                this.#currentCreation = this.#currentCreation.withLayers(newLayers);
                await this.#deps.creationRepository.save(this.#currentCreation);
                await this.#updateView();
            });
        });

        // Preset change - updates width/height inputs then submits
        const presetSelect = sidebar.querySelector('wa-select[name="preset"]');
        presetSelect?.addEventListener('change', (e) => {
            const presetName = e.target.value;
            const preset = this.#presets.find(p => p.name === presetName);
            if (preset) {
                const widthInput = sidebar.querySelector('wa-input[name="width"]');
                const heightInput = sidebar.querySelector('wa-input[name="height"]');
                if (widthInput) {
                    widthInput.value = preset.width;
                }
                if (heightInput) {
                    heightInput.value = preset.height;
                }
                
                // Wait for the components to update their internal state before submitting
                setTimeout(() => {
                    submitForm();
                }, 0);
            }
        });

        // Back
        sidebar.querySelector('#back-to-creations')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#creations';
        });

        // Background: Open Gallery
        sidebar.querySelector('#open-gallery-btn')?.addEventListener('click', () => {
            const modal = container.querySelector('#gallery-modal');
            modal?.show();
        });

        // Background: Upload
        const bgUploadBtn = sidebar.querySelector('#upload-bg-btn');
        const bgInput = sidebar.querySelector('#editor-bg-upload');
        bgUploadBtn?.addEventListener('click', () => bgInput?.click());
        bgInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const newImage = new Image(null, file, this.#deps);
                await this.#deps.imageRepository.save(newImage);
                
                // Update hidden input and submit
                const bgIdInput = sidebar.querySelector('input[name="backgroundImageId"]');
                if (bgIdInput) {
                    bgIdInput.value = newImage.id;
                    submitForm();
                }
            }
        });

        // Slider Reset Buttons
        sidebar.querySelectorAll('.reset-slider-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-target');
                const defaultValue = btn.getAttribute('data-default');
                const slider = sidebar.querySelector(`wa-slider[name="${targetName}"]`);
                if (slider) {
                    slider.value = defaultValue;
                    // Trigger input event for live preview
                    slider.dispatchEvent(new Event('input', { bubbles: true }));
                    // Trigger change event for persistence
                    slider.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });

        // Modal events
        const modal = container.querySelector('#gallery-modal');
        
        // Select from gallery
        const selectButtons = modal?.querySelectorAll('.select-image-btn');
        selectButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (id) {
                    const bgIdInput = sidebar.querySelector('input[name="backgroundImageId"]');
                    if (bgIdInput) {
                        bgIdInput.value = id;
                        modal.open = false;
                        submitForm();
                    }
                }
            });
        });

        // Upload from modal
        const modalUploadTrigger = modal?.querySelector('#modal-upload-trigger');
        const modalFileInput = modal?.querySelector('#modal-image-upload');
        modalUploadTrigger?.addEventListener('click', () => modalFileInput?.click());
        modalFileInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const newImage = new Image(null, file, this.#deps);
                await this.#deps.imageRepository.save(newImage);
                
                const bgIdInput = sidebar.querySelector('input[name="backgroundImageId"]');
                if (bgIdInput) {
                    bgIdInput.value = newImage.id;
                    modal.open = false;
                    submitForm();
                }
            }
        });

        modal?.querySelector('#close-gallery-modal')?.addEventListener('click', () => modal.open = false);
    }
}
