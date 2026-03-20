import Mustache from 'mustache';
import { ModalCancelledError } from '../util/modal-cancelled-error.mjs';

/**
 * Base class for all modals in the application.
 */
export class Modal {
    #deps;
    #container;
    #ownsContainer = false;
    #templateUrl;
    #template = null;
    #dialog = null;
    #resolve = null;
    #reject = null;
    #result = undefined;

    /**
     * @param {Dependencies} deps
     * @param {HTMLElement} [container] - The container where the modal will be rendered. If not provided, one will be created.
     * @param {string} templateUrl - Path to the Mustache template.
     */
    constructor(deps, container, templateUrl) {
        this.#deps = deps;
        if (container) {
            this.#container = container;
            this.#ownsContainer = false;
        } else {
            this.#container = deps.modalManager.createContainer();
            this.#ownsContainer = true;
        }
        this.#templateUrl = templateUrl;
    }

    get deps() {
        return this.#deps;
    }

    get container() {
        return this.#container;
    }

    get template() {
        return this.#template;
    }

    /**
     * Loads the modal template.
     */
    async loadTemplate() {
        if (!this.#template) {
            const res = await fetch(this.#templateUrl);
            this.#template = await res.text();
        }
    }

    /**
     * Renders and opens the modal.
     * @param {Object} [data={}] - Data to pass to the Mustache template.
     * @returns {Promise<any>} - Resolves with the submitted data or rejects when cancelled.
     */
    async open(data = {}) {
        console.log(`Modal: opening ${this.#templateUrl}`);
        await this.loadTemplate();
        
        const rendered = Mustache.render(this.#template, data);
        this.#container.innerHTML = rendered;
        
        this.#dialog = this.#container.querySelector('wa-dialog');
        if (!this.#dialog) {
            throw new Error(`Template ${this.#templateUrl} must contain a <wa-dialog> element.`);
        }

        this.bindEvents();

        // Wait for the custom element to be defined and upgraded
        await customElements.whenDefined('wa-dialog');
        
        // Wait for the component to be ready before calling show()
        if (this.#dialog.updateComplete) {
            await this.#dialog.updateComplete;
        }

        this.#dialog.open = true;
        await this.onRender(this.#dialog, data);

        return new Promise((resolve, reject) => {
            this.#resolve = (val) => {
                console.log(`Modal: resolving ${this.#templateUrl}`, val);
                this.#resolve = null;
                this.#reject = null;
                resolve(val);
            };
            this.#reject = (err) => {
                console.log(`Modal: rejecting ${this.#templateUrl}`, err);
                this.#resolve = null;
                this.#reject = null;
                reject(err);
            };
        });
    }

    /**
     * Closes the modal and resolves the promise with the provided data.
     * @param {any} [result]
     */
    submit(result) {
        console.log(`Modal: submit() called for ${this.#templateUrl}`, result);
        this.#result = result;
        if (this.#dialog && this.#dialog.open) {
            this.#dialog.open = false;
        } else {
            // Fallback if dialog is already gone or already closed
            console.warn(`Modal: submit() called but dialog is missing or closed for ${this.#templateUrl}`);
            this.#resolve?.(result);
        }
    }
    
    cancel() {
        console.log(`Modal: cancel() called for ${this.#templateUrl}`);
        this.#result = undefined;
        if (this.#dialog && this.#dialog.open) {
            this.#dialog.open = false;
        } else {
            // Fallback if dialog is already gone or already closed
            console.warn(`Modal: cancel() called but dialog is missing or closed for ${this.#templateUrl}`);
            this.#reject?.(new ModalCancelledError());
        }
    }

    /**
     * Shows the dialog if it's already rendered.
     */
    show() {
        if (this.#dialog) {
            this.#dialog.open = true;
        }
    }

    /**
     * Hides the dialog and waits for it to be fully closed and cleaned up.
     * @returns {Promise<void>}
     */
    async hide() {
        if (this.#dialog) {
            console.log(`Modal: hide() called for ${this.#templateUrl}`);
            const hidePromise = new Promise(resolve => {
                this.#dialog.addEventListener('wa-after-hide', () => {
                    console.log(`Modal: wa-after-hide promise resolving for ${this.#templateUrl}`);
                    resolve();
                }, { once: true });
            });
            this.#dialog.open = false;
            await hidePromise;
        }
    }

    bindEvents() {
        this.#dialog.addEventListener('wa-hide', (e) => {
            console.log(`Modal: wa-hide received for ${this.#templateUrl}`);
            // We don't resolve here, we wait for wa-after-hide
        });

        this.#dialog.addEventListener('wa-after-hide', () => {
            console.log(`Modal: wa-after-hide received for ${this.#templateUrl}`);
            const resolve = this.#resolve;
            const reject = this.#reject;
            const result = this.#result;

            this.onDestroy();
            
            // Only clear the container if this dialog is still in it.
            // This prevents race conditions where the next modal has already rendered.
            if (this.#container.contains(this.#dialog)) {
                console.log(`Modal: clearing container for ${this.#templateUrl}`);
                this.#container.innerHTML = '';
            } else {
                console.log(`Modal: NOT clearing container for ${this.#templateUrl} as it doesn't contain the dialog anymore`);
            }
            
            if (this.#ownsContainer) {
                console.log(`Modal: removing container for ${this.#templateUrl}`);
                this.#deps.modalManager.removeContainer(this.#container);
            }
            
            this.#dialog = null;

            if (resolve && result !== undefined) {
                resolve(result);
            } else if (reject) {
                reject(new ModalCancelledError());
            }
        });

        this.#dialog.addEventListener('wa-show', () => {
            console.log(`Modal: wa-show received for ${this.#templateUrl}`);
            this.onShow(this.#dialog);
        });

        this.#dialog.addEventListener('wa-after-show', () => {
            console.log(`Modal: wa-after-show received for ${this.#templateUrl}`);
            this.onAfterShow(this.#dialog);
        });
    }

    /**
     * Hook called after rendering but before showing the modal.
     * @param {HTMLElement} dialog
     * @param {Object} data
     */
    onRender(dialog, data) {}

    /**
     * Hook called when the modal starts showing.
     * @param {HTMLElement} dialog
     */
    onShow(dialog) {}

    /**
     * Hook called after the modal is fully shown.
     * @param {HTMLElement} dialog
     */
    onAfterShow(dialog) {}

    /**
     * Hook called after the modal is hidden and before the container is cleared.
     */
    onDestroy() {}
}
