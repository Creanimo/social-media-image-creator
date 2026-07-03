import { LayerFormAdapter } from '../layer-form-adapter.mjs';

/**
 * Adapter for LogoLayer.
 */
export class LogoLayerFormAdapter extends LayerFormAdapter {
    get type() {
        return 'logo';
    }

    extractUpdated(layer, sidebar, index) {
        let updatedLayer = super.extractUpdated(layer, sidebar, index);
        const logoIdInput = sidebar.querySelector(`input[name="layer-${index}-logoId"]`);
        const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
        const widthSlider = sidebar.querySelector(`wa-slider[name="layer-${index}-width"]`);
        const widthValue = widthSlider && widthSlider.value !== '' ? parseInt(widthSlider.value) : null;
        const opacitySlider = sidebar.querySelector(`wa-slider[name="layer-${index}-opacity"]`);
        const opacityValue = opacitySlider && opacitySlider.value !== '' ? parseInt(opacitySlider.value) : 100;
        const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
        const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);

        if (logoIdInput && logoIdInput.value) updatedLayer = updatedLayer.withLogoId(logoIdInput.value);
        if (slotValue !== undefined) updatedLayer = updatedLayer.withSlot(slotValue);
        if (widthValue !== undefined) updatedLayer = updatedLayer.withWidth(widthValue);
        if (opacityValue !== undefined) updatedLayer = updatedLayer.withOpacity(opacityValue);
        if (!isNaN(offsetXValue)) updatedLayer = updatedLayer.withOffsetX(offsetXValue);
        if (!isNaN(offsetYValue)) updatedLayer = updatedLayer.withOffsetY(offsetYValue);

        return updatedLayer;
    }
}
