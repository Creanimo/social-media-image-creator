import { Image } from '../model/image.mjs';
import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing Logo objects in IndexedDB.
 */
export class LogoRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'logos');
    }

    /**
     * Saves a logo to the database.
     * @param {Image|object} logo
     * @returns {Promise<void>}
     */
    async save(logo) {
        // Use toData if available
        if (typeof logo.toData === 'function') {
            return this._putRaw(logo.toData());
        }

        const data = {
            id: logo.id,
            name: logo.name,
            imageBlob: logo.imageBlob,
            category: logo.category || 'logo'
        };
        return this._putRaw(data);
    }

    /**
     * Gets a logo by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Image|null>}
     */
    async get(id, deps = null) {
        const data = await this._getRaw(id);
        if (!data) return null;
        return new Image(data.id, data.imageBlob, data.category || 'logo', data.name || 'Untitled', deps);
    }

    /**
     * Gets all logos.
     * @param {Dependencies} [deps]
     * @returns {Promise<Image[]>}
     */
    async getAll(deps = null) {
        const rawResults = await this._getAllRaw();
        return rawResults.map(data => new Image(data.id, data.imageBlob, data.category || 'logo', data.name || 'Untitled', deps));
    }
}
