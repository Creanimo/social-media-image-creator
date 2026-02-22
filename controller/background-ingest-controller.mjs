/**
 * Controller to handle the ingestion of background images from presets.
 */
export class BackgroundIngestController {
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Ingests backgrounds from presets/backgrounds/backgrounds.json.
     * Skips backgrounds that are already in the repository.
     * @returns {Promise<void>}
     */
    async ingest() {
        try {
            const response = await fetch('presets/backgrounds/backgrounds.json');
            if (!response.ok) {
                console.warn('[BackgroundIngestController] No backgrounds.json found at presets/backgrounds/backgrounds.json');
                return;
            }

            const data = await response.json();
            const backgrounds = data.backgrounds || [];

            for (const bgInfo of backgrounds) {
                const existing = await this.#deps.backgroundRepository.get(bgInfo.id);
                if (existing) {
                    // console.log(`[BackgroundIngestController] Background ${bgInfo.id} already exists, skipping.`);
                    continue;
                }

                // Ingest new background
                console.log(`[BackgroundIngestController] Ingesting new background: ${bgInfo.id}`);
                const blob = await this.#fetchImage(bgInfo.id, bgInfo.filename);
                if (blob) {
                    const background = {
                        ...bgInfo,
                        imageBlob: blob
                    };
                    await this.#deps.backgroundRepository.save(background);
                    console.log(`[BackgroundIngestController] Successfully ingested ${bgInfo.id}`);
                } else {
                    console.error(`[BackgroundIngestController] Failed to fetch image for background: ${bgInfo.id}`);
                }
            }
        } catch (error) {
            console.error('[BackgroundIngestController] Ingestion failed:', error);
        }
    }

    /**
     * Fetches the image for a background ID, trying common extensions if no filename is specified.
     * @param {string} id
     * @param {string} [filename]
     * @returns {Promise<Blob|null>}
     */
    async #fetchImage(id, filename) {
        if (filename) {
            const response = await fetch(`presets/backgrounds/${filename}`);
            if (response.ok) return await response.blob();
            // If failed, fall back to trying extensions based on ID
        }

        const extensions = ['png', 'jpg', 'jpeg', 'svg'];
        for (const ext of extensions) {
            const response = await fetch(`presets/backgrounds/${id}.${ext}`);
            if (response.ok) {
                return await response.blob();
            }
        }

        return null;
    }
}
