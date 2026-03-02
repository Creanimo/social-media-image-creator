import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing Image Preset objects in IndexedDB.
 */
export class ImagePresetRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'image_presets');
    }

    /**
     * Saves an image preset to the database.
     * @param {object} preset
     * @returns {Promise<void>}
     */
    async save(preset) {
        // Use toData if available
        if (typeof preset.toData === 'function') {
            return this._putRaw(preset.toData());
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

        const data = sanitize(preset);
        return this._putRaw(data);
    }

    /**
     * Gets an image preset by ID.
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async get(id) {
        return this._getRaw(id);
    }

    /**
     * Gets all image presets.
     * @returns {Promise<object[]>}
     */
    async getAll() {
        return this._getAllRaw();
    }
}
