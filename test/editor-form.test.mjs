import { expect } from '../node_modules/chai/index.js';
import { FontLayerFormAdapter } from '../adapter/layer-form-adapters/font-layer-form-adapter.mjs';
import { MarkdownRenderer } from '../util/markdown-renderer.mjs';
import { FontLayer } from '../model/font-layer.mjs';
import { ImageLayer } from '../model/image-layer.mjs';
import { LayerFormAdapter } from '../adapter/layer-form-adapter.mjs';
import { IconLayerFormAdapter } from '../adapter/layer-form-adapters/icon-layer-form-adapter.mjs';
import { IconLayer } from '../model/icon-layer.mjs';

describe('Editor Form Adapters', () => {
    let sidebar;

    beforeEach(() => {
        // Create a mock sidebar container
        sidebar = document.createElement('div');
    });

    /**
     * Helper to create a mock input/select/slider element.
     */
    function createMockElement(tagName, name, value) {
        const el = document.createElement(tagName);
        el.setAttribute('name', name);
        el.value = value;
        sidebar.appendChild(el);
        return el;
    }

    describe('FontLayerFormAdapter', () => {
        let adapter;
        let layer;
        let markdownRenderer;

        beforeEach(() => {
            markdownRenderer = new MarkdownRenderer();
            adapter = new FontLayerFormAdapter(markdownRenderer);
            layer = new FontLayer('test-id', {
                name: 'Initial Name',
                text: 'Initial Text',
                slot: 'center-middle',
                size: 24,
                offsetX: 0,
                offsetY: 0
            });
        });

        it('should extract updated text and HTML', () => {
            createMockElement('wa-input', 'layer-0-name', 'Updated Text');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.text).to.equal('Updated Text');
            expect(updated.name).to.equal('Updated Text');
            expect(updated.html).to.equal('Updated Text');
            expect(updated).to.not.equal(layer);
        });

        it('should handle markdown in text for HTML generation', () => {
            createMockElement('wa-input', 'layer-0-name', 'Hello **World**');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.text).to.equal('Hello **World**');
            expect(updated.html).to.equal('Hello <strong>World</strong>');
        });

        it('should extract updated slot and styleId', () => {
            createMockElement('wa-select', 'layer-0-slot', 'top-left');
            createMockElement('wa-select', 'layer-0-styleId', 'style-123');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.slot).to.equal('top-left');
            expect(updated.styleId).to.equal('style-123');
        });

        it('should extract updated size and width', () => {
            createMockElement('wa-input', 'layer-0-size', '48');
            createMockElement('wa-slider', 'layer-0-width', '500');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.size).to.equal(48);
            expect(updated.width).to.equal(500);
        });

        it('should extract updated offsets', () => {
            createMockElement('wa-slider', 'layer-0-offsetX', '10');
            createMockElement('wa-slider', 'layer-0-offsetY', '-20');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.offsetX).to.equal(10);
            expect(updated.offsetY).to.equal(-20);
        });

        it('should handle empty size input as null', () => {
            createMockElement('wa-input', 'layer-0-size', '');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.size).to.be.null;
        });
    });

    describe('IconLayerFormAdapter', () => {
        let adapter;
        let layer;

        beforeEach(() => {
            adapter = new IconLayerFormAdapter();
            layer = new IconLayer('icon-id', {
                name: 'Old Icon',
                icon: 'photo',
                color: '#000000',
                size: 48
            });
        });

        it('should extract updated icon and color', () => {
            createMockElement('input', 'layer-0-icon', 'tabler:home');
            createMockElement('input', 'layer-0-color', '#ff0000');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.icon).to.equal('home');
            expect(updated.color).to.equal('#ff0000');
        });

        it('should extract updated slot and size', () => {
            createMockElement('wa-select', 'layer-0-slot', 'bottom-right');
            createMockElement('wa-input', 'layer-0-size', '64');
            
            const updated = adapter.extractUpdated(layer, sidebar, 0);

            expect(updated.slot).to.equal('bottom-right');
            expect(updated.size).to.equal(64);
        });
    });

    describe('LayerFormAdapter (Base)', () => {
        let adapter;

        beforeEach(() => {
            adapter = new LayerFormAdapter();
        });

        it('should extract updated name for generic layers', () => {
            const layer = new ImageLayer('img-id', { name: 'Old Image' });
            createMockElement('wa-input', 'layer-1-name', 'New Image Name');

            const updated = adapter.extractUpdated(layer, sidebar, 1);

            expect(updated.name).to.equal('New Image Name');
            expect(updated).to.not.equal(layer);
        });

        it('should return same layer if no inputs found', () => {
            const layer = new ImageLayer('img-id', { name: 'Old Image' });
            
            const updated = adapter.extractUpdated(layer, sidebar, 1);

            expect(updated).to.equal(layer);
        });
    });
});
