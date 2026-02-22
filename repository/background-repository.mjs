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
        return this._putRaw(background);
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
