export class FontStyleController {
    urls = [];
    styles = [];

    async init() {
        const response = await fetch('presets/font-styles/font-styles.json');
        const data = await response.json();
        this.styles = data['font-styles'];
        this.urls = this.styles.map(style => `presets/font-styles/${style.id}.css`);
    }

    getUrls() {
        return this.urls;
    }

    getStyles() {
        return this.styles;
    }
}