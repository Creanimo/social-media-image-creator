import Mustache from 'mustache';

/**
 * View for the font styles list.
 */
export class FontStyleListView {
    #container;
    #template;

    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        this.#container = container;
        this.#template = null;
    }

    /**
     * Loads the templates.
     */
    async loadTemplates() {
        const response = await fetch('view/templates/font-style-list.mustache');
        this.#template = await response.text();
    }

    /**
     * Renders the font styles list.
     * @param {Array} styles
     */
    render(styles) {
        const rendered = Mustache.render(this.#template, { styles });
        this.#container.innerHTML = rendered;
    }

    /**
     * @returns {HTMLElement}
     */
    get container() {
        return this.#container;
    }
}
