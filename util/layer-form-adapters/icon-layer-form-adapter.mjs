import { LayerFormAdapter } from '../layer-form-adapter.mjs';

/**
 * Adapter for IconLayer.
 */
export class IconLayerFormAdapter extends LayerFormAdapter {
    get type() {
        return 'icon';
    }

    extractUpdated(layer, sidebar, index) {
        let updatedLayer = super.extractUpdated(layer, sidebar, index);
        const iconValue = sidebar.querySelector(`input[name="layer-${index}-icon"]`)?.value || 'photo';
        const colorValue = sidebar.querySelector(`input[name="layer-${index}-color"]`)?.value || '#000000';
        const slotValue = sidebar.querySelector(`wa-select[name="layer-${index}-slot"]`)?.value;
        const sizeInput = sidebar.querySelector(`wa-input[name="layer-${index}-size"]`);
        const sizeValue = sizeInput && sizeInput.value !== '' ? parseInt(sizeInput.value) : null;
        const offsetXValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetX"]`)?.value);
        const offsetYValue = parseInt(sidebar.querySelector(`wa-slider[name="layer-${index}-offsetY"]`)?.value);

        if (slotValue !== undefined) updatedLayer = updatedLayer.withSlot(slotValue);
        if (iconValue !== undefined) updatedLayer = updatedLayer.withIcon(iconValue);
        if (colorValue !== undefined) updatedLayer = updatedLayer.withColor(colorValue);
        if (sizeValue !== undefined) updatedLayer = updatedLayer.withSize(sizeValue);
        if (!isNaN(offsetXValue)) updatedLayer = updatedLayer.withOffsetX(offsetXValue);
        if (!isNaN(offsetYValue)) updatedLayer = updatedLayer.withOffsetY(offsetYValue);

        return updatedLayer;
    }
}
