export class LivePreviewPipeline {
    #iframe;
    #sidebar;

    constructor(iframe, sidebar) {
        this.#iframe = iframe;
        this.#sidebar = sidebar;
    }

    send(type, data) {
        if (this.#iframe && this.#iframe.contentWindow) {
            this.#iframe.contentWindow.postMessage({ type, data }, '*');
        }
    }

    sendUpdate(name, value) {
        if (name === 'backgroundScale' || name === 'backgroundX' || name === 'backgroundY') {
            const scaleSlider = this.#sidebar.querySelector('wa-slider[name="backgroundScale"]');
            const xSlider = this.#sidebar.querySelector('wa-slider[name="backgroundX"]');
            const ySlider = this.#sidebar.querySelector('wa-slider[name="backgroundY"]');

            this.send('UPDATE_BACKGROUND', {
                scale: parseFloat(scaleSlider?.value),
                x: parseInt(xSlider?.value),
                y: parseInt(ySlider?.value)
            });
        } else if (name.startsWith('layer-')) {
            const match = name.match(/layer-(\d+)-(offsetX|offsetY|size|color)/);
            if (match) {
                const index = parseInt(match[1]);
                const offsetXSlider = this.#sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`);
                const offsetYSlider = this.#sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`);
                const sizeInput = this.#sidebar.querySelector(`wa-input[name="layer-${index}-size"]`);
                const colorInput = this.#sidebar.querySelector(`input[name="layer-${index}-color"]`);

                this.send('UPDATE_LAYER', {
                    index,
                    offsetX: parseInt(offsetXSlider?.value),
                    offsetY: parseInt(offsetYSlider?.value),
                    size: sizeInput?.value ? parseInt(sizeInput.value) : null,
                    color: colorInput?.value
                });
            }
        }
    }
}
