import 'iconify-picker';

export class IconPickerController {
    #view;
    #id;
    #onChange;

    constructor(view, id, onChange) {
        this.#view = view;
        this.#id = id;
        this.#onChange = onChange;
    }

    async init(data) {
        await this.#view.loadTemplate();
        this.#view.render({ ...data, id: this.#id });
        this.#bindEvents();
    }

    #bindEvents() {
        const container = this.#view.container;
        const trigger = container.querySelector(`#icon-picker-trigger-${this.#id}`);
        const clear = container.querySelector(`#icon-picker-clear-${this.#id}`);
        const picker = container.querySelector(`#icon-picker-${this.#id}`);
        const input = container.querySelector(`#icon-picker-input-${this.#id}`);
        const preview = container.querySelector(`#icon-picker-preview-${this.#id}`);
        const label = container.querySelector(`#icon-picker-label-${this.#id}`);

        trigger?.addEventListener('click', (e) => {
            e.preventDefault();
            picker.toggle();
        });

        clear?.addEventListener('click', (e) => {
            e.preventDefault();
            this.#updateValue('', input, preview, label);
        });

        picker?.addEventListener('icon-selected', (e) => {
            let iconName = e.detail.iconName;
            if (iconName.startsWith('tabler:')) {
                iconName = iconName.replace('tabler:', '');
            }
            this.#updateValue(iconName, input, preview, label);
            picker.hide();
        });
    }

    #updateValue(value, input, preview, label) {
        if (input) input.value = value;
        if (preview) preview.name = value || 'photo';
        if (label) label.textContent = value || 'Choose Icon';
        
        if (this.#onChange) {
            this.#onChange(value);
        }
    }
}
