import { Creation } from '../model/creation.mjs';
import { Layer } from '../model/layer.mjs';

/**
 * Repository for managing Creation objects in IndexedDB.
 */
export class CreationRepository {
    #db;

    /**
     * @param {Database} db
     */
    constructor(db) {
        this.#db = db;
    }

    /**
     * Saves a creation to the database.
     * @param {Creation} creation
     * @returns {Promise<void>}
     */
    async save(creation) {
        const store = await this.#db.getStore('creations', 'readwrite');
        
        // Convert to plain object for IndexedDB
        const data = { ...creation };
        
        // Handle layers specifically if they exist
        if (data.layers) {
            data.layers = data.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible
            }));
        }
        
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gets a creation by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Creation|null>}
     */
    async get(id, deps = null) {
        const store = await this.#db.getStore('creations', 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                const data = request.result;
                if (!data) return resolve(null);
                
                const { id, ...properties } = data;
                resolve(new Creation(id, properties, deps));
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gets all creations.
     * @param {Dependencies} [deps]
     * @returns {Promise<Creation[]>}
     */
    async getAll(deps = null) {
        const store = await this.#db.getStore('creations', 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result.map(data => {
                    const { id, ...properties } = data;
                    return new Creation(id, properties, deps);
                });
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Deletes a creation by ID.
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const store = await this.#db.getStore('creations', 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
