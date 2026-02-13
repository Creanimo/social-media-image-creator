import { EditorView } from '../view/editor-view.mjs';
import { Image } from '../model/image.mjs';
import { Creation } from '../model/creation.mjs';

export class EditorController {
    #deps;
    #view;
    #currentCreation;
    #presets;

    constructor(deps, container, sidebarContainer) {
        this.#deps = deps;
        this.#view = new EditorView(container, sidebarContainer, deps.imageUrlManager);
        this.#currentCreation = null;
        this.#presets = [];
    }

    async init() {
        // Load presets
        const response = await fetch('presets/image-sizes.json');
        const data = await response.json();
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
            this.#currentCreation = new Creation(
                null,
                "Untitled",
                1080,
                1080,
                '',
                [],
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

    async #updateView() {
        let bgSrc = null;
        if (this.#currentCreation?.backgroundImageId) {
            const img = await this.#deps.imageRepository.get(this.#currentCreation.backgroundImageId, this.#deps);
            if (img) {
                bgSrc = this.#deps.imageUrlManager.getUrl(img.id, img.imageBlob);
            }
        }

        const galleryImages = await this.#deps.imageRepository.getAll(this.#deps);
        
        this.#view.render(this.#currentCreation, {
            presets: this.#presets,
            bgSrc,
            galleryImages
        });
        this.#bindEvents();
    }

    #bindEvents() {
        const container = this.#view.container;
        const sidebar = this.#view.sidebarContainer;
        const form = sidebar.querySelector('#editor-settings-form');

        // Form submission / Auto-save
        const submitForm = async () => {
            if (!form || !this.#currentCreation) {
                return;
            }

            // Extract values directly from elements to be safe with custom elements
            const titleInput = sidebar.querySelector('wa-input[name="title"]');
            const widthInput = sidebar.querySelector('wa-input[name="width"]');
            const heightInput = sidebar.querySelector('wa-input[name="height"]');
            const bgIdInput = sidebar.querySelector('input[name="backgroundImageId"]');

            // Use .value which is the getter for WebAwesome components
            const titleValue = titleInput ? titleInput.value : '';
            const widthValue = widthInput ? widthInput.value : '';
            const heightValue = heightInput ? heightInput.value : '';
            const backgroundImageId = bgIdInput ? bgIdInput.value : '';

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

            if (updatedCreation !== this.#currentCreation) {
                this.#currentCreation = updatedCreation;
                await this.#deps.creationRepository.save(this.#currentCreation);
                await this.#updateView();
            }
        };

        // Listen for changes in the form
        form?.querySelectorAll('wa-input, wa-select').forEach(el => {
            // Use standard 'change' event as 'wa-change' is not emitted by the components
            el.addEventListener('change', () => {
                submitForm();
            });

            if (el.tagName === 'WA-INPUT') {
                // Also trigger on blur for immediate feedback after typing
                el.addEventListener('blur', () => {
                    submitForm();
                });
            }
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
        sidebar.querySelector('#back-to-creations')?.addEventListener('click', () => {
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
