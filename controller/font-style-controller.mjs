export class FontStyleController {
    urls;

    async init() {
        const response = await fetch('presets/font-styles/font-styles.json');
        const data = await response.json();
    }
}