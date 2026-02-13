/**
 * Simple IndexedDB manager for the application.
 */
export class Database {
    #dbName;
    #dbVersion;
    #db;

    /**
     * @param {string} dbName
     * @param {number} dbVersion
     */
    constructor(dbName = 'CreanimoSocialMediaImageCreatorDB', dbVersion = 1) {
        this.#dbName = dbName;
        this.#dbVersion = dbVersion;
        this.#db = null;
    }

    /**
     * Initializes the database and creates stores if they don't exist.
     * @returns {Promise<IDBDatabase>}
     */
    async connect() {
        if (this.#db) return this.#db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, this.#dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve(this.#db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Image library store
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'id' });
                }

                // Creation library store
                if (!db.objectStoreNames.contains('creations')) {
                    db.createObjectStore('creations', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Generic method to get a transaction.
     * @param {string} storeName
     * @param {IDBTransactionMode} mode
     * @returns {Promise<IDBObjectStore>}
     */
    async getStore(storeName, mode = 'readonly') {
        const db = await this.connect();
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
}
