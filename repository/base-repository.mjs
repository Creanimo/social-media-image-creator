/**
 * Base repository for managing objects in IndexedDB.
 */
export class BaseRepository {
    _db;
    _storeName;

    /**
     * @param {Database} db
     * @param {string} storeName
     */
    constructor(db, storeName) {
        this._db = db;
        this._storeName = storeName;
    }

    /**
     * Deletes an object by ID.
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const store = await this._db.getStore(this._storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gets an object by ID.
     * @param {string} id
     * @returns {Promise<any|null>}
     */
    async _getRaw(id) {
        const store = await this._db.getStore(this._storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gets all objects from the store.
     * @returns {Promise<any[]>}
     */
    async _getAllRaw() {
        const store = await this._db.getStore(this._storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Saves an object (plain data) to the database.
     * @param {object} data
     * @returns {Promise<void>}
     */
    async _putRaw(data) {
        const store = await this._db.getStore(this._storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            try {
                const request = store.put(data);
                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error(`[BaseRepository] IDB Error in ${this._storeName}:`, request.error);
                    console.error('[BaseRepository] Payload:', data);
                    reject(request.error);
                };
            } catch (err) {
                console.error(`[BaseRepository] Caught exception in ${this._storeName}:`, err);
                console.error('[BaseRepository] Payload:', data);
                // Additional check for non-cloneable objects
                this.#deepInspect(data);
                reject(err);
            }
        });
    }

    #deepInspect(obj, path = 'root') {
        if (obj === null || typeof obj !== 'object') return;
        if (obj instanceof Blob) return;
        
        if (typeof obj === 'function') {
            console.error(`[BaseRepository] Found function at ${path}:`, obj);
        }

        const symbols = Object.getOwnPropertySymbols(obj);
        if (symbols.length > 0) {
            console.error(`[BaseRepository] Found symbols at ${path}:`, symbols);
        }

        if (Array.isArray(obj)) {
            obj.forEach((item, i) => this.#deepInspect(item, `${path}[${i}]`));
        } else {
            for (const key in obj) {
                this.#deepInspect(obj[key], `${path}.${key}`);
            }
        }
    }
}
