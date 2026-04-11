/**
 * Simple markdown renderer to convert basic markdown (bold, italic) and newlines to HTML.
 */
export class MarkdownRenderer {
    /**
     * Renders a markdown string to HTML.
     * 
     * @param {string} text - The text to render.
     * @returns {string} The rendered HTML.
     */
    render(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
}
