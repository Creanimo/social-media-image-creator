/**
 * Controller to handle the ingestion of image presets.
 */
export class ImagePresetIngestController {
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Ingests image presets from presets/images/images.json.
     * @returns {Promise<void>}
     */
    async ingest() {
        return this.#deps.assetIngestService.ingest({
            manifestUrl: '/presets/images/images.json',
            assetPath: '/presets/images/',
            collectionProperty: 'images',
            repository: this.#deps.imagePresetRepository,
            logTag: 'ImagePresetIngestController',
            mapAsset: (existing, assetInfo, isExisting) => {
                if (isExisting) return existing;
                return { 
                    ...assetInfo, 
                    category: assetInfo.category || 'image' 
                };
            }
        });
    }
}
