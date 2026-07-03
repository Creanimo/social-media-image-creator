import { Image } from '../model/image.mjs';
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
     * @param {Image|object} background
     * @returns {Promise<void>}
     */
    async save(background) {
        // Use toData if available
        if (typeof background.toData === 'function') {
            return this._putRaw(background.toData());
        }

        const data = {
            id: background.id,
            name: background.name,
            imageBlob: background.imageBlob,
            category: background.category || 'background'
        };
        return this._putRaw(data);
    }

    /**
     * Gets a background by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Image|null>}
     */
    async get(id, deps = null) {
        const data = await this._getRaw(id);
        if (!data) return null;
        return new Image(data.id, data.imageBlob, data.category || 'background', data.name || 'Untitled', deps);
    }

    /**
     * Gets all backgrounds.
     * @param {Dependencies} [deps]
     * @returns {Promise<Image[]>}
     */
    async getAll(deps = null) {
        const rawResults = await this._getAllRaw();
        return rawResults.map(data => new Image(data.id, data.imageBlob, data.category || 'background', data.name || 'Untitled', deps));
    }
}
