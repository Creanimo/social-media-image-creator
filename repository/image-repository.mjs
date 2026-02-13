import { Image } from '../model/image.mjs';

/**
 * Repository for managing Image objects in IndexedDB.
 */
export class ImageRepository {
    #db;

    /**
     * @param {Database} db
     */
    constructor(db) {
        this.#db = db;
    }

    /**
     * Saves an image to the database.
     * @param {Image} image
     * @returns {Promise<void>}
     */
    async save(image) {
        const store = await this.#db.getStore('images', 'readwrite');
        // Convert to plain object for IndexedDB
        const data = {
            id: image.id,
            imageBlob: image.imageBlob
        };
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gets an image by ID.
     * @param {string} id
     * @param {Dependencies} [deps]
     * @returns {Promise<Image|null>}
     */
    async get(id, deps = null) {
        const store = await this.#db.getStore('images', 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                const data = request.result;
                if (!data) return resolve(null);
                resolve(new Image(data.id, data.imageBlob, deps));
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gets all images.
     * @param {Dependencies} [deps]
     * @returns {Promise<Image[]>}
     */
    async getAll(deps = null) {
        const store = await this.#db.getStore('images', 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result.map(data => new Image(data.id, data.imageBlob, deps));
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Deletes an image by ID.
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const store = await this.#db.getStore('images', 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
