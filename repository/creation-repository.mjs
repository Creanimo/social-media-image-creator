import { Creation } from '../model/creation.mjs';
import { Layer } from '../model/layer.mjs';
import { BaseRepository } from './base-repository.mjs';

/**
 * Repository for managing Creation objects in IndexedDB.
 */
export class CreationRepository extends BaseRepository {
    /**
     * @param {Database} db
     */
    constructor(db) {
        super(db, 'creations');
    }

    /**
     * Saves a creation to the database.
     * @param {Creation} creation
     * @param {boolean} [isThumbnailUpdate=false]
     * @returns {Promise<void>}
     */
    async save(creation, isThumbnailUpdate = false) {
        // Update lastEdited timestamp and clear thumbnail association before saving
        // This ensures a new thumbnail will be generated in the creations view.
        // If this is a thumbnail update, we don't want to clear it again.
        let creationToSave = creation;
        if (!isThumbnailUpdate) {
            creationToSave = creation
                .withLastEdited(Date.now())
                .withThumbnailId(null);
        }
            
        const data = creationToSave.toData();
        return this._putRaw(data);
    }

    /**
     * Gets a creation by ID.
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
     * Gets all creations.
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
