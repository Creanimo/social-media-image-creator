import { Image } from '../model/image.mjs';
import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing Image objects in IndexedDB.
 */
export class ImageRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'images');
    }

    /**
     * Saves an image to the database.
     * @param {Image} image
     * @returns {Promise<void>}
     */
    async save(image) {
        // Use the model's toData method if available, else use manual conversion
        // Note: Blobs are serializable and should NOT be JSON stringified
        const data = typeof image.toData === 'function' 
            ? image.toData() 
            : {
                id: image.id,
                imageBlob: image.imageBlob,
                category: image.category
            };
        return this._putRaw(data);
    }

    /**
     * Gets an image by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Image|null>}
     */
    async get(id, deps = null) {
        const data = await this._getRaw(id);
        if (!data) return null;
        return new Image(data.id, data.imageBlob, data.category || 'background', deps);
    }

    /**
     * Gets all images.
     * @param {Dependencies} [deps]
     * @returns {Promise<Image[]>}
     */
    async getAll(deps = null) {
        const rawResults = await this._getAllRaw();
        return rawResults.map(data => new Image(data.id, data.imageBlob, data.category || 'background', deps));
    }
}
