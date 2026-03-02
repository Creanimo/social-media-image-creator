import Mustache from 'mustache';

export class CreationsView {
    #container;
    #template;

    constructor(container) {
        this.#container = container;
        this.#template = null;
    }

    async loadTemplates() {
        const res = await fetch('view/templates/creation-library.mustache');
        this.#template = await res.text();
    }

    render(creations, presets) {
        const rendered = Mustache.render(this.#template, { creations, presets });
        this.#container.innerHTML = rendered;
    }

    get container() {
        return this.#container;
    }
}
