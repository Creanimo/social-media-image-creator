import { expect } from '../node_modules/chai/index.js';
import { MarkdownRenderer } from '../util/markdown-renderer.mjs';

describe('MarkdownRenderer', () => {
    let renderer;

    beforeEach(() => {
        renderer = new MarkdownRenderer();
    });

    it('should render bold text', () => {
        const input = 'Hello **World**';
        const expected = 'Hello <strong>World</strong>';
        expect(renderer.render(input)).to.equal(expected);
    });

    it('should render italic text', () => {
        const input = 'Hello *World*';
        const expected = 'Hello <em>World</em>';
        expect(renderer.render(input)).to.equal(expected);
    });

    it('should render newlines as <br>', () => {
        const input = 'Line 1\nLine 2';
        const expected = 'Line 1<br>Line 2';
        expect(renderer.render(input)).to.equal(expected);
    });

    it('should handle multiple styles combined', () => {
        const input = '**Bold** and *Italic*\nNext Line';
        const expected = '<strong>Bold</strong> and <em>Italic</em><br>Next Line';
        expect(renderer.render(input)).to.equal(expected);
    });

    it('should return empty string for null or empty input', () => {
        expect(renderer.render('')).to.equal('');
        expect(renderer.render(null)).to.equal('');
    });
});
