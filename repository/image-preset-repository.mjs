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
        return this._putRaw(preset);
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
