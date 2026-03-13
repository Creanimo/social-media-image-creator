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
        const { index, offsetX, offsetY, size, color, width, html } = data;
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

                // For icon-layer, the size is also on the first child div
                const firstChild = layer.querySelector('div');
                if (firstChild && layer.classList.contains('icon-layer')) {
                    firstChild.style.fontSize = size ? `${size}px` : '';
                }
                
                // For icon callout text
                const calloutText = layer.querySelector('.icon-callout-layer__text');
                if (calloutText) {
                    calloutText.style.fontSize = size ? `${size}px` : '';
                }
            }
            if (color !== undefined) {
                layer.style.color = color;
                // Also update wa-icon inside if it exists
                const icon = layer.querySelector('wa-icon');
                if (icon) {
                    icon.style.color = color;
                }

                // For icon-layer, the color is also on the first child div
                const firstChild = layer.querySelector('div');
                if (firstChild && layer.classList.contains('icon-layer')) {
                    firstChild.style.color = color;
                }
                
                // For icon callout text
                const calloutText = layer.querySelector('.icon-callout-layer__text');
                if (calloutText) {
                    calloutText.style.color = color;
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
            if (html !== undefined) {
                // For font layers
                const span = layer.querySelector('span');
                if (span) {
                    span.innerHTML = html;
                }
                // For icon callout layers
                const calloutText = layer.querySelector('.icon-callout-layer__text');
                if (calloutText) {
                    calloutText.innerHTML = html;
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

// Signal that the renderer is ready
const signalReady = async () => {
    // Wait for all webawesome components to be defined and updated
    const components = Array.from(document.querySelectorAll('*')).filter(el => el.tagName.startsWith('WA-'));
    
    await Promise.all(components.map(async (el) => {
        const tagName = el.tagName.toLowerCase();
        if (customElements.get(tagName)) {
            // If it's already a custom element, wait for it to be ready
            if (el.updateComplete) {
                await el.updateComplete;
            }
        } else {
            // Otherwise wait for it to be defined
            await customElements.whenDefined(tagName);
            // Then wait for one update cycle
            const updatedEl = document.querySelector(tagName);
            if (updatedEl && updatedEl.updateComplete) {
                await updatedEl.updateComplete;
            }
        }

        // Specific wait for icons
        if (tagName === 'wa-icon') {
            // Check if it already loaded (has an svg in shadow dom)
            const hasSvg = el.shadowRoot && el.shadowRoot.querySelector('svg');
            if (!hasSvg) {
                await new Promise(resolve => {
                    const timeout = setTimeout(() => {
                        console.warn('[canvas-live-preview] wa-icon load timed out', el.name);
                        resolve();
                    }, 2000);
                    el.addEventListener('wa-load', () => {
                        clearTimeout(timeout);
                        resolve();
                    }, { once: true });
                    el.addEventListener('wa-error', (err) => {
                        clearTimeout(timeout);
                        console.error('[canvas-live-preview] wa-icon load error', el.name, err);
                        resolve();
                    }, { once: true });
                });
            }
        }
    }));

    // Additional small delay to ensure icons are actually rendered in the DOM/Shadow DOM
    // Sometimes updateComplete is not enough for the icon font/SVG to be fully injected
    await new Promise(resolve => setTimeout(resolve, 200));

    // Wait for all images to be loaded
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails to load
        });
    }));

    window.parent.postMessage({ type: 'RENDER_READY' }, '*');
};

if (document.readyState === 'complete') {
    signalReady();
} else {
    window.addEventListener('load', signalReady);
}
