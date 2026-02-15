import { FontStyleListView } from '../view/font-style-list-view.mjs';

/**
 * Controller for managing the font styles list view.
 */
export class FontStyleListController {
    #fontStyleController;
    #view;

    /**
     * @param {FontStyleController} fontStyleController
     * @param {HTMLElement} container
     */
    constructor(fontStyleController, container) {
        this.#fontStyleController = fontStyleController;
        this.#view = new FontStyleListView(container);
    }

    /**
     * Initializes the font styles list.
     */
    async init() {
        await this.#view.loadTemplates();
        await this.refresh();
    }

    /**
     * Refreshes the view.
     */
    async refresh() {
        const styles = this.#fontStyleController.getStyles();
        this.#view.render(styles);
    }
}
