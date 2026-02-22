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
     * @returns {Promise<void>}
     */
    async save(creation) {
        // Convert to plain object for IndexedDB
        const data = { ...creation };
        
        // Handle layers specifically if they exist
        if (data.layers) {
            data.layers = data.layers.map(layer => {
                const plainLayer = { ...layer };
                // Ensure we don't store the immerable symbol or other non-plain data if any
                delete plainLayer[Symbol.for('immerable')]; 
                return plainLayer;
            });
        }
        
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
