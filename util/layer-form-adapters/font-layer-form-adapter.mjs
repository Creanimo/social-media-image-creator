import { LayerFormAdapter } from '../layer-form-adapter.mjs';

/**
 * Adapter for FontLayer.
 */
export class FontLayerFormAdapter extends LayerFormAdapter {
    get type() {
        return 'font';
    }

    extractUpdated(layer, sidebar, index) {
        let updatedLayer = super.extractUpdated(layer, sidebar, index);

        const fontText = sidebar.querySelector(`wa-input[name="layer-${index}-name"]`)?.value || '';
        const html = fontText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
        const cappedName = fontText.substring(0, 30);
        
        const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
        const styleIdValue = sidebar.querySelector(`wa-select[name="layer-${index}-styleId"]`)?.value;
        const sizeInput = sidebar.querySelector(`wa-input[name="layer-${index}-size"]`);
        const sizeValue = sizeInput && sizeInput.value !== '' ? parseInt(sizeInput.value) : null;
        const widthSlider = sidebar.querySelector(`wa-slider[name="layer-${index}-width"]`);
        const widthValue = widthSlider && widthSlider.value !== '' ? parseInt(widthSlider.value) : null;
        const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
        const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);
        
        if (slotValue !== undefined) updatedLayer = updatedLayer.withSlot(slotValue);
        if (styleIdValue !== undefined) updatedLayer = updatedLayer.withStyleId(styleIdValue);
        if (fontText !== undefined) updatedLayer = updatedLayer.withText(fontText).withHtml(html).withName(cappedName);
        if (sizeValue !== undefined) updatedLayer = updatedLayer.withSize(sizeValue);
        if (widthValue !== undefined) updatedLayer = updatedLayer.withWidth(widthValue);
        if (!isNaN(offsetXValue)) updatedLayer = updatedLayer.withOffsetX(offsetXValue);
        if (!isNaN(offsetYValue)) updatedLayer = updatedLayer.withOffsetY(offsetYValue);
        
        return updatedLayer;
    }
}
