/**
 * Controller to handle the ingestion of logo presets.
 */
export class LogoIngestController {
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Ingests logos from presets/logo/logos.json.
     * @returns {Promise<void>}
     */
    async ingest() {
        return this.#deps.assetIngestService.ingest({
            manifestUrl: '/presets/logo/logos.json',
            assetPath: '/presets/logo/',
            collectionProperty: 'logos',
            repository: this.#deps.logoRepository,
            logTag: 'LogoIngestController',
            mapAsset: (existing, assetInfo, isExisting) => {
                if (isExisting) return existing;
                return { 
                    ...assetInfo, 
                    name: assetInfo.name || assetInfo.filename || 'Untitled',
                    category: assetInfo.category || 'logo' 
                };
            }
        });
    }
}
