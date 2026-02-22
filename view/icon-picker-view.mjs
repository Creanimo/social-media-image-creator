import Mustache from 'mustache';

export class IconPickerView {
    #template;
    #container;

    constructor(container) {
        this.#container = container;
        this.#template = null;
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
            id: data.id || Math.random().toString(36).substring(2, 9),
            name: data.name,
            value: data.value || 'photo',
            label: data.label
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
