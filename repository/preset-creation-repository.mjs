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
     * @returns {Promise<void>}
     */
    async save(presetData) {
        // If it's a model instance, use its toData() method
        if (typeof presetData.toData === 'function') {
            return this._putRaw(presetData.toData());
        }

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

        const data = sanitize(presetData);
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
