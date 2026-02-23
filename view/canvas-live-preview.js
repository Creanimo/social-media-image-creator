const LivePreviewReceiver = {
    UPDATE_BACKGROUND: (data) => {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            if (data.scale !== undefined) {
                canvas.style.backgroundSize = `${data.scale * 100}% auto`;
            }
            if (data.x !== undefined || data.y !== undefined) {
                const x = data.x !== undefined ? data.x : 0;
                const y = data.y !== undefined ? data.y : 0;
                canvas.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
            }
        }
    },
    UPDATE_LAYER: (data) => {
        const { index, offsetX, offsetY, size, color, width } = data;
        const layer = document.querySelector(`[data-index="${index}"]`);
        if (layer) {
            if (offsetX !== undefined || offsetY !== undefined) {
                const ox = !isNaN(offsetX) ? offsetX : 0;
                const oy = !isNaN(offsetY) ? offsetY : 0;
                // Update the first child div which has the transform
                const contentDiv = layer.querySelector('div');
                if (contentDiv) {
                    contentDiv.style.transform = `translate(${ox}px, ${oy}px)`;
                }
            }
            if (size !== undefined) {
                layer.style.fontSize = size ? `${size}px` : '';
                // Also update wa-icon inside if it exists
                const icon = layer.querySelector('wa-icon');
                if (icon) {
                    icon.style.fontSize = size ? `${size}px` : '';
                }
            }
            if (color !== undefined) {
                layer.style.color = color;
                // Also update wa-icon inside if it exists
                const icon = layer.querySelector('wa-icon');
                if (icon) {
                    icon.style.color = color;
                }
            }
            if (width !== undefined) {
                // Set width on the layer container for font and callout layers
                layer.style.width = width ? `${width}px` : '';
                // For icon callout layers, also update the inner wa-flank width
                const calloutContent = layer.querySelector('.wa-flank');
                if (calloutContent) {
                    calloutContent.style.width = width ? `${width}px` : '';
                }
                // For image layers, also update the inner <img> width so the visual updates immediately
                const img = layer.querySelector('img');
                if (img) {
                    img.style.width = width ? `${width}px` : '';
                }
            }
        }
    }
};

window.addEventListener('message', (event) => {
    // Check origin for security if necessary
    // if (event.origin !== window.location.origin) return;

    const { type, data } = event.data;
    if (LivePreviewReceiver[type]) {
        LivePreviewReceiver[type](data);
    }
});
