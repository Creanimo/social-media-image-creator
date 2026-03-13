import { Creation } from '../model/creation.mjs';
import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing Preset Creation objects in IndexedDB.
 */
export class PresetCreationRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'preset_creations');
    }

    /**
     * Saves a preset creation to the database.
     * @param {Creation|Object} presetData
     * @param {boolean} [isThumbnailUpdate=false]
     * @returns {Promise<void>}
     */
    async save(presetData, isThumbnailUpdate = false) {
        // Deep clone to ensure we have a plain object, while preserving Blobs
        const sanitize = (obj) => {
            if (obj instanceof Blob) return obj;
            if (Array.isArray(obj)) return obj.map(sanitize);
            if (obj !== null && typeof obj === 'object') {
                const cleaned = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        cleaned[key] = sanitize(obj[key]);
                    }
                }
                return cleaned;
            }
            return obj;
        };

        let data = (typeof presetData.toData === 'function') 
            ? presetData.toData() 
            : sanitize(presetData);
            
        // For presets, if lastEdited is missing, set it to the ingestion time
        if (!data.lastEdited) {
            data.lastEdited = Date.now();
        }
        
        // If this is NOT a thumbnail update, we might want to clear it if it was changed
        // But presets aren't normally edited in the UI. 
        // If they ARE updated through ingestion, we might want to clear the thumbnail.
        if (!isThumbnailUpdate && data.thumbnailId) {
             data.thumbnailId = null;
        }
        
        return this._putRaw(data);
    }

    /**
     * Gets a preset creation by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Creation|null>}
     */
    async get(id, deps = null) {
        const data = await this._getRaw(id);
        if (!data) return null;
        
        const { id: creationId, ...properties } = data;
        return new Creation(creationId, properties, deps);
    }

    /**
     * Gets all preset creations.
     * @param {Dependencies} [deps]
     * @returns {Promise<Creation[]>}
     */
    async getAll(deps = null) {
        const rawResults = await this._getAllRaw();
        return rawResults.map(data => {
            const { id: creationId, ...properties } = data;
            return new Creation(creationId, properties, deps);
        });
    }
}
