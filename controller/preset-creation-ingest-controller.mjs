/**
 * Controller to handle the ingestion of preset creations.
 */
export class PresetCreationIngestController {
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Ingests preset creations from presets/template-creations/creations.json (with fallback).
     * Supports both `{ creations: [...] }` and `[...]` root schemas.
     * @returns {Promise<void>}
     */
    async ingest() {
        const primaryUrl = '/presets/template-creations/creations.json';
        const fallbackUrl = '/presets/creations/creations.json';
        const logTag = 'PresetCreationIngestController';

        try {
            let response = await fetch(primaryUrl);
            if (!response.ok) {
                console.warn(`[${logTag}] Primary manifest not found at ${primaryUrl} (${response.status}). Trying fallback...`);
                response = await fetch(fallbackUrl);
                if (!response.ok) {
                    console.warn(`[${logTag}] No manifest found at fallback ${fallbackUrl}`, response.status, response.statusText);
                    return;
                }
            }

            const data = await response.json();
            const creations = Array.isArray(data) ? data : (data.creations || []);

            const assetPath = '/presets/template-creations/';

            for (const creationInfo of creations) {
                if (!creationInfo?.id) continue;
                const existing = await this.#deps.presetCreationRepository.get(creationInfo.id);
                
                // If it exists and we're not missing data, skip
                // But we want to ensure we have the full template data if filename is present
                if (existing && !creationInfo.filename) continue;
                if (existing && existing.width && existing.height && existing.layers?.length > 0) continue;

                let creationData = creationInfo;
                if (creationInfo.filename) {
                    const fullUrl = `${assetPath}${creationInfo.filename}`;
                    const templateResponse = await fetch(fullUrl);
                    if (templateResponse.ok) {
                        creationData = await templateResponse.json();
                    } else {
                        console.error(`[${logTag}] Failed to fetch creation file ${creationInfo.filename} from ${fullUrl}`);
                        continue;
                    }
                }

                if (creationData.creation) {
                    // It's a full template with metadata and images array
                    await this.#deps.importJson.importFromObject(creationData, true);
                } else {
                    // It's just the creation object itself
                    await this.#deps.presetCreationRepository.save(creationData);
                }
                console.log(`[${logTag}] Successfully ingested preset creation ${creationData.id || creationData.creation?.id}`);
            }
        } catch (error) {
            console.error(`[${logTag}] Ingestion failed:`, error);
        }
    }
}
