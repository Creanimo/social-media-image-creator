import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing Background objects in IndexedDB.
 */
export class BackgroundRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'backgrounds');
    }

    /**
     * Saves a background to the database.
     * @param {object} background
     * @returns {Promise<void>}
     */
    async save(background) {
        // Use toData if available
        if (typeof background.toData === 'function') {
            return this._putRaw(background.toData());
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

        const data = sanitize(background);
        return this._putRaw(data);
    }

    /**
     * Gets a background by ID.
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async get(id) {
        return this._getRaw(id);
    }

    /**
     * Gets all backgrounds.
     * @returns {Promise<object[]>}
     */
    async getAll() {
        return this._getAllRaw();
    }
}
