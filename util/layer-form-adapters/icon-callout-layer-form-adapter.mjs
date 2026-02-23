import { LayerFormAdapter } from '../layer-form-adapter.mjs';

/**
 * Adapter for IconCalloutLayer.
 */
export class IconCalloutLayerFormAdapter extends LayerFormAdapter {
    get type() {
        return 'icon-callout';
    }

    extractUpdated(layer, sidebar, index) {
        const fontText = sidebar.querySelector(`wa-textarea[name="layer-${index}-text"]`)?.value || '';
        const html = fontText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

        const iconValue = sidebar.querySelector(`input[name="layer-${index}-icon"]`)?.value || 'info-circle';
        const colorValue = sidebar.querySelector(`input[name="layer-${index}-color"]`)?.value || '#000000';
        const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
        const styleIdValue = sidebar.querySelector(`wa-select[name="layer-${index}-styleId"]`)?.value;
        const sizeInput = sidebar.querySelector(`wa-input[name="layer-${index}-size"]`);
        const sizeValue = sizeInput && sizeInput.value !== '' ? parseInt(sizeInput.value) : null;
        const widthSlider = sidebar.querySelector(`wa-slider[name="layer-${index}-width"]`);
        const widthValue = widthSlider && widthSlider.value !== '' ? parseInt(widthSlider.value) : null;
        const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
        const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);

        let updatedLayer = layer;
        if (slotValue !== undefined) updatedLayer = updatedLayer.withSlot(slotValue);
        if (styleIdValue !== undefined) updatedLayer = updatedLayer.withStyleId(styleIdValue);
        if (fontText !== undefined) updatedLayer = updatedLayer.withText(fontText).withHtml(html);
        if (iconValue !== undefined) updatedLayer = updatedLayer.withIcon(iconValue);
        if (colorValue !== undefined) updatedLayer = updatedLayer.withColor(colorValue);
        if (sizeValue !== undefined) updatedLayer = updatedLayer.withSize(sizeValue);
        if (widthValue !== undefined) updatedLayer = updatedLayer.withWidth(widthValue);
        if (!isNaN(offsetXValue)) updatedLayer = updatedLayer.withOffsetX(offsetXValue);
        if (!isNaN(offsetYValue)) updatedLayer = updatedLayer.withOffsetY(offsetYValue);

        return updatedLayer;
    }
}
