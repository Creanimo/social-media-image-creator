import { Modal } from './modal.mjs';

/**
 * Component for cropping an image.
 */
export class CropModal extends Modal {
    #cropper;
    #imageUrl;
    #originalBlob;

    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} [container]
     */
    constructor(deps, container) {
        super(deps, container, 'view/templates/crop-modal.mustache');
    }

    /**
     * Shows the crop modal for an image.
     * @param {Object|Blob|File} imageOrBlob - The image object or blob to crop.
     * @returns {Promise<{blob: Blob, mode: 'new'|'override'}>}
     */
    async show(imageOrBlob) {
        let blob;
        let showOverride = false;

        if (imageOrBlob instanceof Blob || imageOrBlob instanceof File) {
            blob = imageOrBlob;
        } else if (imageOrBlob && imageOrBlob.imageBlob) {
            blob = imageOrBlob.imageBlob;
            showOverride = true; // It's an existing image from repository
        } else {
            throw new Error('Invalid image provided for cropping');
        }

        this.#originalBlob = blob;
        this.#imageUrl = URL.createObjectURL(blob);

        try {
            return await this.open({ showOverride });
        } finally {
            URL.revokeObjectURL(this.#imageUrl);
            this.#imageUrl = null;
            this.#originalBlob = null;
        }
    }

    onRender(dialog) {
        dialog.addEventListener('click', (e) => {
            const target = e.target.closest('wa-button');
            if (!target) return;

            const id = target.id;
            
            if (id === 'crop-cancel') {
                this.cancel();
            } else if (id === 'crop-no-crop') {
                if (this.#originalBlob) {
                    this.submit({ blob: this.#originalBlob, mode: 'no-crop' });
                }
            } else if (id === 'crop-save-new') {
                this.#handleCroppedSubmit('new');
            } else if (id === 'crop-override') {
                this.#handleCroppedSubmit('override');
            }
        });
    }

    async #handleCroppedSubmit(mode) {
        const croppedBlob = await this.#getCroppedBlob();
        if (croppedBlob) {
            this.submit({ blob: croppedBlob, mode });
        }
    }

    onAfterShow(dialog) {
        const container = dialog.querySelector('#crop-container');
        // ImageCropper is a global from /node_modules/vanilla-image-cropper/dist/js/imagecrop.min.js
        this.#cropper = new window.ImageCropper(container, this.#imageUrl, {
            max_width: 800,
            max_height: 600
        });
    }

    onDestroy() {
        if (this.#cropper) {
            this.#cropper.destroy();
            this.#cropper = null;
        }
    }

    async #getCroppedBlob() {
        if (!this.#cropper) return null;
        
        const dataUrl = this.#cropper.crop('image/png');
        const response = await fetch(dataUrl);
        return await response.blob();
    }
}
