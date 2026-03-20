import { Modal } from './modal.mjs';

/**
 * Modal for choosing the type of layer to add.
 */
export class AddLayerModal extends Modal {
    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} [container]
     */
    constructor(deps, container) {
        super(deps, container, 'view/templates/add-layer-modal.mustache');
    }

    onRender(dialog) {
        dialog.addEventListener('click', (e) => {
            const target = e.target.closest('[data-type], #close-add-layer-modal');
            if (!target) return;

            if (target.id === 'close-add-layer-modal') {
                this.cancel();
            } else {
                const type = target.getAttribute('data-type');
                if (type) {
                    this.submit(type);
                }
            }
        });
    }
}
