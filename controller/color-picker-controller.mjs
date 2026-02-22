export class ColorPickerController {
    #view;
    #onChange;
    #swatches;

    constructor(view, onChange) {
        this.#view = view;
        this.#onChange = onChange;
        this.#swatches = '';
    }

    async init({ name, value, label, noFullPicker = false }) {
        if (!this.#swatches) {
            await this.#fetchSwatches();
        }

        const host = this.#view.render({
            name,
            value,
            label,
            swatches: this.#swatches,
            noFullPicker
        });

        const picker = host.querySelector('wa-color-picker');
        const hiddenInput = host.querySelector('input[type="hidden"]');

        picker.addEventListener('change', (e) => {
            const newValue = e.target.value;
            hiddenInput.value = newValue;
            if (this.#onChange) {
                console.log(`[ColorPickerController] change detected, newValue: ${newValue}`);
                this.#onChange(newValue, false);
            }
        });

        picker.addEventListener('input', (e) => {
            const newValue = e.target.value;
            hiddenInput.value = newValue;
            if (this.#onChange) {
                this.#onChange(newValue, true);
            }
        });
    }

    async #fetchSwatches() {
        try {
            const response = await fetch('presets/styles/variables.css');
            const css = await response.text();
            
            // Extract --palette-color- variables
            const paletteRegex = /--palette-color-[\w-]+:\s*(#[a-fA-F0-9]{3,6}|rgba?\(.*?\)|hsla?\(.*?\))/g;
            const matches = css.matchAll(paletteRegex);
            const colors = [];
            for (const match of matches) {
                // The match is e.g. "--palette-color-01: #502379"
                const parts = match[0].split(':');
                if (parts.length === 2) {
                    colors.push(parts[1].trim());
                }
            }
            
            this.#swatches = colors.join('; ');
        } catch (error) {
            console.error('[ColorPickerController] Failed to fetch swatches:', error);
            // Default fallback if variables.css is not reachable
            this.#swatches = '#d0021b; #f5a623; #f8e71c; #8b572a; #7ed321; #417505; #bd10e0; #9013fe; #4a90e2; #50e3c2; #b8e986; #000; #444; #888; #ccc; #fff;';
        }
    }
}
