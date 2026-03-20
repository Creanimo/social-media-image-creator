import { LayerFormAdapter } from '../layer-form-adapter.mjs';

/**
 * Adapter for ImageLayer.
 */
export class ImageLayerFormAdapter extends LayerFormAdapter {
    get type() {
        return 'image';
    }

    extractUpdated(layer, sidebar, index) {
        let updatedLayer = super.extractUpdated(layer, sidebar, index);
        const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
        const widthSlider = sidebar.querySelector(`wa-slider[name="layer-${index}-width"]`);
        const widthValue = widthSlider && widthSlider.value !== '' ? parseInt(widthSlider.value) : null;
        const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
        const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);
        const brightnessValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-brightness"]`)?.value);
        const contrastValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-contrast"]`)?.value);
        const sepiaValue = parseFloat(sidebar.querySelector(`wa-slider[name="layer-${index}-sepia"]`)?.value);
        const hueValue = parseFloat(sidebar.querySelector(`wa-slider[name="layer-${index}-hue"]`)?.value);
        const saturateValue = parseFloat(sidebar.querySelector(`wa-slider[name="layer-${index}-saturate"]`)?.value);

        if (slotValue !== undefined) updatedLayer = updatedLayer.withSlot(slotValue);
        if (widthValue !== undefined) updatedLayer = updatedLayer.withWidth(widthValue);
        if (!isNaN(offsetXValue)) updatedLayer = updatedLayer.withOffsetX(offsetXValue);
        if (!isNaN(offsetYValue)) updatedLayer = updatedLayer.withOffsetY(offsetYValue);
        if (!isNaN(brightnessValue)) updatedLayer = updatedLayer.withBrightness(brightnessValue);
        if (!isNaN(contrastValue)) updatedLayer = updatedLayer.withContrast(contrastValue);
        if (!isNaN(sepiaValue)) updatedLayer = updatedLayer.withSepia(sepiaValue);
        if (!isNaN(hueValue)) updatedLayer = updatedLayer.withHue(hueValue);
        if (!isNaN(saturateValue)) updatedLayer = updatedLayer.withSaturate(saturateValue);

        return updatedLayer;
    }
}
