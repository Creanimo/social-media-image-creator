import { expect } from '../node_modules/chai/index.js';
import { Database } from '../util/database.mjs';

describe('Database (IndexedDB)', () => {
    let db;
    const testDbName = 'TestCreanimoDB';

    beforeEach(async () => {
        db = new Database(testDbName, 1);
    });

    afterEach(async () => {
        await db.deleteDatabase();
    });

    it('should connect to the database and initialize stores', async () => {
        const idb = await db.connect();
        
        expect(idb).to.not.be.null;
        expect(idb.name).to.equal(testDbName);
        
        const storeNames = Array.from(idb.objectStoreNames);
        expect(storeNames).to.include('images');
        expect(storeNames).to.include('creations');
        expect(storeNames).to.include('backgrounds');
    });

    it('should clear a store', async () => {
        await db.connect();
        
        // Add a dummy record to 'images' store
        const store = await db.getStore('images', 'readwrite');
        await new Promise((resolve, reject) => {
            const request = store.add({ id: 'test-id', data: 'test-data' });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        // Verify record exists
        const storeRead = await db.getStore('images', 'readonly');
        const count = await new Promise((resolve, reject) => {
            const request = storeRead.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        expect(count).to.equal(1);

        // Clear store
        await db.clearStore('images');

        // Verify store is empty
        const storeAfter = await db.getStore('images', 'readonly');
        const countAfter = await new Promise((resolve, reject) => {
            const request = storeAfter.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        expect(countAfter).to.equal(0);
    });
});
