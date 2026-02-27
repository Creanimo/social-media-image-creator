/**
 * Generic service to handle the ingestion of assets from JSON manifests into repositories.
 */
export class AssetIngestService {
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Ingests assets from a JSON manifest into a specific repository.
     * @param {Object} options
     * @param {string} options.manifestUrl - URL to the JSON manifest
     * @param {string} options.assetPath - Base path for asset files
     * @param {string} options.collectionProperty - Property name in JSON containing the asset array
     * @param {import('../repository/base-repository.mjs').BaseRepository} options.repository - Target repository
     * @param {Function} [options.mapAsset] - Optional function to transform/enrich asset data before saving
     * @param {string} [options.logTag] - Tag for logging
     * @returns {Promise<void>}
     */
    async ingest({ manifestUrl, assetPath, collectionProperty, repository, mapAsset, logTag = 'AssetIngestService' }) {
        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) {
                console.warn(`[${logTag}] No manifest found at ${manifestUrl}`, response.status, response.statusText);
                return;
            }

            const data = await response.json();
            const assets = data[collectionProperty] || [];

            for (const assetInfo of assets) {
                const existing = await repository.get(assetInfo.id);
                
                // Allow custom logic for existing assets via mapAsset if needed, 
                // but usually we just skip or update if missing fields.
                if (existing) {
                    if (mapAsset) {
                        const updated = mapAsset(existing, assetInfo, true);
                        if (updated && updated !== existing) {
                            await repository.save(updated);
                        }
                    }
                    continue;
                }

                const blob = await this.fetchImage(assetInfo.id, assetPath, assetInfo.filename, logTag);
                if (blob) {
                    let asset = { ...assetInfo, imageBlob: blob };
                    if (mapAsset) {
                        asset = mapAsset(null, asset, false);
                    }
                    await repository.save(asset);
                    console.log(`[${logTag}] Successfully ingested ${assetInfo.id}`);
                } else {
                    console.error(`[${logTag}] Failed to fetch image for asset: ${assetInfo.id}`);
                }
            }
        } catch (error) {
            console.error(`[${logTag}] Ingestion failed:`, error);
        }
    }

    /**
     * Fetches an image, trying common extensions if no filename is specified.
     * @param {string} id
     * @param {string} basePath
     * @param {string} [filename]
     * @param {string} [logTag]
     * @returns {Promise<Blob|null>}
     */
    async fetchImage(id, basePath, filename, logTag = 'AssetIngestService') {
        const cleanBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
        
        if (filename) {
            const response = await fetch(`${cleanBasePath}${filename}`);
            if (response.ok) {
                return await response.blob();
            }
            console.warn(`[${logTag}] Failed to fetch ${filename}: ${response.status}`);
        }

        const extensions = ['png', 'jpg', 'jpeg', 'svg'];
        for (const ext of extensions) {
            const path = `${cleanBasePath}${id}.${ext}`;
            const response = await fetch(path);
            if (response.ok) {
                return await response.blob();
            }
        }

        return null;
    }
}
