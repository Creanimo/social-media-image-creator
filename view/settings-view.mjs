import Mustache from 'mustache';

export class SettingsView {
    #container;
    #template;

    constructor(container) {
        this.#container = container;
        this.#template = null;
    }

    async loadTemplates() {
        const res = await fetch('view/templates/settings.mustache');
        this.#template = await res.text();
    }

    render() {
        const rendered = Mustache.render(this.#template, {});
        this.#container.innerHTML = rendered;
    }

    get container() {
        return this.#container;
    }
}
