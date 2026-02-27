import Mustache from 'mustache';
import { Dependencies } from "../util/dependencies.mjs";

export class IconPickerView {
    #template;
    #container;
    #dependencies;

    constructor(container) {
        this.#container = container;
        this.#template = null;
        this.#dependencies = Dependencies
    }

    async loadTemplate() {
        if (!this.#template) {
            const response = await fetch('view/templates/icon-picker.mustache');
            this.#template = await response.text();
        }
        return this.#template;
    }

    render(data) {
        const rendered = Mustache.render(this.#template, {
            id: data.id || this.#dependencies.idGenerator.generate(),
            name: data.name,
            value: data.value || 'photo',
            label: data.label,
            color: data.color || '#000000'
        });
        
        if (this.#container) {
            this.#container.innerHTML = rendered;
        }
        return rendered;
    }

    get container() {
        return this.#container;
    }
}
