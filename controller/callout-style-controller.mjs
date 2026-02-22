export class CalloutStyleController {
    urls = [];
    styles = [];

    async init() {
        const response = await fetch('presets/callout-styles/callout-styles.json');
        const data = await response.json();
        this.styles = data['callout-styles'];
        this.urls = this.styles.map(style => `presets/callout-styles/${style.id}.css`);
    }

    getUrls() {
        return this.urls;
    }

    getStyles() {
        return this.styles;
    }
}
