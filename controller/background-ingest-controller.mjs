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
            const response = await fetch('/presets/backgrounds/backgrounds.json');
            if (!response.ok) {
                console.warn('[BackgroundIngestController] No backgrounds.json found at /presets/backgrounds/backgrounds.json', response.status, response.statusText);
                return;
            }

            const data = await response.json();
            console.log('[BackgroundIngestController] backgrounds.json data:', data);
            const backgrounds = data.backgrounds || [];

            for (const bgInfo of backgrounds) {
                console.log(`[BackgroundIngestController] Checking background: ${bgInfo.id}`);
                const existing = await this.#deps.backgroundRepository.get(bgInfo.id);
                if (existing) {
                    console.log(`[BackgroundIngestController] Background ${bgInfo.id} exists. Category: ${existing.category}`);
                    if (!existing.category) {
                        console.log(`[BackgroundIngestController] Updating background ${bgInfo.id} with category 'background'.`);
                        const updated = {
                            ...existing,
                            category: 'background'
                        };
                        await this.#deps.backgroundRepository.save(updated);
                    }
                    continue;
                }

                // Ingest new background
                console.log(`[BackgroundIngestController] Ingesting new background: ${bgInfo.id}`);
                const blob = await this.#fetchImage(bgInfo.id, bgInfo.filename);
                if (blob) {
                    const background = {
                        ...bgInfo,
                        imageBlob: blob,
                        category: 'background'
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
        console.log(`[BackgroundIngestController] Fetching image for ${id}, filename: ${filename}`);
        if (filename) {
            const response = await fetch(`/presets/backgrounds/${filename}`);
            if (response.ok) {
                console.log(`[BackgroundIngestController] Successfully fetched ${filename}`);
                return await response.blob();
            }
            console.warn(`[BackgroundIngestController] Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
            // If failed, fall back to trying extensions based on ID
        }

        const extensions = ['png', 'jpg', 'jpeg', 'svg'];
        for (const ext of extensions) {
            const path = `/presets/backgrounds/${id}.${ext}`;
            console.log(`[BackgroundIngestController] Trying fallback: ${path}`);
            const response = await fetch(path);
            if (response.ok) {
                console.log(`[BackgroundIngestController] Successfully fetched fallback: ${path}`);
                return await response.blob();
            }
        }

        console.error(`[BackgroundIngestController] All fetch attempts failed for ${id}`);
        return null;
    }
}
