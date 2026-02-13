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
        // We need to handle the layers as well
        const data = {
            id: creation.id,
            title: creation.title,
            width: creation.width,
            height: creation.height,
            backgroundImageId: creation.backgroundImageId,
            layers: creation.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible
            }))
        };
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
                
                const layers = data.layers.map(l => new Layer(l.id, l.name, l.visible, deps));
                resolve(new Creation(
                    data.id,
                    data.title,
                    data.width,
                    data.height,
                    data.backgroundImageId,
                    layers,
                    deps
                ));
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
                    const layers = data.layers.map(l => new Layer(l.id, l.name, l.visible, deps));
                    return new Creation(
                        data.id,
                        data.title,
                        data.width,
                        data.height,
                        data.backgroundImageId,
                        layers,
                        deps
                    );
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
