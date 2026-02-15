window.addEventListener('message', (event) => {
    // Check origin for security if necessary
    // if (event.origin !== window.location.origin) return;

    const { type, data } = event.data;

    if (type === 'UPDATE_BACKGROUND') {
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
    }

    if (type === 'UPDATE_LAYER') {
        const { index, offsetX, offsetY, size } = data;
        const layer = document.querySelector(`.font-layer[data-index="${index}"]`);
        if (layer) {
            if (offsetX !== undefined || offsetY !== undefined) {
                const ox = offsetX !== undefined ? offsetX : 0;
                const oy = offsetY !== undefined ? offsetY : 0;
                layer.style.transform = `translate(${ox}px, ${oy}px)`;
            }
            if (size !== undefined) {
                layer.style.fontSize = size ? `${size}px` : '';
            }
        }
    }
});
