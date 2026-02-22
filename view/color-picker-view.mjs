import Mustache from 'mustache';

export class ColorPickerView {
    #container;
    #template;

    constructor(container, template) {
        this.#container = container;
        this.#template = template;
    }

    render(data) {
        const rendered = Mustache.render(this.#template, data);
        this.#container.innerHTML = rendered;
        return this.#container.querySelector('.color-picker-host');
    }

    get container() {
        return this.#container;
    }
}
