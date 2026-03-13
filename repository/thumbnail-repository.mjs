import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing thumbnail blobs in IndexedDB.
 */
export class ThumbnailRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'thumbnails');
    }

    /**
     * Saves a thumbnail blob.
     * @param {string} id 
     * @param {Blob} blob 
     * @returns {Promise<void>}
     */
    async save(id, blob) {
        return this._putRaw({ id, blob });
    }

    /**
     * Gets a thumbnail blob by ID.
     * @param {string} id 
     * @returns {Promise<Blob|null>}
     */
    async get(id) {
        const data = await this._getRaw(id);
        return data ? data.blob : null;
    }
}
