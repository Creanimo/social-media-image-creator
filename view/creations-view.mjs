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

    render(creations) {
        const rendered = Mustache.render(this.#template, { creations });
        this.#container.innerHTML = rendered;
    }

    get container() {
        return this.#container;
    }
}
