import { Image } from '../model/image.mjs';
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
     * @param {Image|object} preset
     * @returns {Promise<void>}
     */
    async save(preset) {
        // Use toData if available
        if (typeof preset.toData === 'function') {
            return this._putRaw(preset.toData());
        }

        const data = {
            id: preset.id,
            name: preset.name,
            imageBlob: preset.imageBlob,
            category: preset.category || 'image'
        };
        return this._putRaw(data);
    }

    /**
     * Gets an image preset by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Image|null>}
     */
    async get(id, deps = null) {
        const data = await this._getRaw(id);
        if (!data) return null;
        return new Image(data.id, data.imageBlob, data.category || 'image', data.name || 'Untitled', deps);
    }

    /**
     * Gets all image presets.
     * @param {Dependencies} [deps]
     * @returns {Promise<Image[]>}
     */
    async getAll(deps = null) {
        const rawResults = await this._getAllRaw();
        return rawResults.map(data => new Image(data.id, data.imageBlob, data.category || 'image', data.name || 'Untitled', deps));
    }
}
