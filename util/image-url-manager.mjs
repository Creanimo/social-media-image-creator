/**
 * Utility to manage Object URLs for Blobs to prevent memory leaks.
 */
export class ImageUrlManager {
    #urls;

    constructor() {
        /** @type {Map<string, string>} */
        this.#urls = new Map();
    }

    /**
     * Creates or retrieves a URL for a given Blob and ID.
     * @param {string} id Unique identifier for the image (e.g., Image.id)
     * @param {Blob} blob The image data
     * @returns {string} The Object URL
     */
    getUrl(id, blob) {
        if (this.#urls.has(id)) {
            return this.#urls.get(id);
        }

        const url = URL.createObjectURL(blob);
        this.#urls.set(id, url);
        return url;
    }

    /**
     * Revokes a specific URL by ID.
     * @param {string} id 
     */
    revoke(id) {
        if (this.#urls.has(id)) {
            URL.revokeObjectURL(this.#urls.get(id));
            this.#urls.delete(id);
        }
    }

    /**
     * Revokes all managed URLs.
     */
    revokeAll() {
        for (const url of this.#urls.values()) {
            URL.revokeObjectURL(url);
        }
        this.#urls.clear();
    }

    /**
     * Revokes all URLs except those in the provided list of IDs.
     * Useful for refreshing a list of images.
     * @param {string[]} keepIds 
     */
    revokeExcept(keepIds) {
        const keepSet = new Set(keepIds);
        for (const [id, url] of this.#urls.entries()) {
            if (!keepSet.has(id)) {
                URL.revokeObjectURL(url);
                this.#urls.delete(id);
            }
        }
    }
}
