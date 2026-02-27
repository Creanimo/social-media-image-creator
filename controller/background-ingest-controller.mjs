import { AssetIngestService } from '../service/asset-ingest-service.mjs';

/**
 * Controller to handle the ingestion of background images from presets.
 */
export class BackgroundIngestController {
    #assetIngestService;
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
        this.#assetIngestService = new AssetIngestService(deps);
    }

    /**
     * Ingests backgrounds from presets/backgrounds/backgrounds.json.
     * @returns {Promise<void>}
     */
    async ingest() {
        return this.#assetIngestService.ingest({
            manifestUrl: '/presets/backgrounds/backgrounds.json',
            assetPath: '/presets/backgrounds/',
            collectionProperty: 'backgrounds',
            repository: this.#deps.backgroundRepository,
            logTag: 'BackgroundIngestController',
            mapAsset: (existing, assetInfo, isExisting) => {
                if (isExisting) {
                    if (!existing.category) {
                        return { ...existing, category: 'background' };
                    }
                    return existing;
                }
                return { ...assetInfo, category: 'background' };
            }
        });
    }
}
