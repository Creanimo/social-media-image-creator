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

        if (slotValue !== undefined) updatedLayer = updatedLayer.withSlot(slotValue);
        if (widthValue !== undefined) updatedLayer = updatedLayer.withWidth(widthValue);
        if (!isNaN(offsetXValue)) updatedLayer = updatedLayer.withOffsetX(offsetXValue);
        if (!isNaN(offsetYValue)) updatedLayer = updatedLayer.withOffsetY(offsetYValue);

        return updatedLayer;
    }
}
