import { Dependencies } from '../util/dependencies.mjs';
import { Creation } from '../model/creation.mjs';
import { Image } from '../model/image.mjs';

/**
 * Service to import a creation and its associated images from a JSON string.
 */
export class ImportJson {
    /** @type {Dependencies} */
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Ingests a creation and its images from a JSON string.
     * @param {string} json
     * @returns {Promise<Creation>}
     */
    async importFromJson(json) {
        /** @type {{creation: Object, images: Array}} */
        const data = JSON.parse(json);

        if (!data.creation) {
            throw new Error('Invalid JSON: missing creation data');
        }

        // 1. Ingest images first
        if (data.images && Array.isArray(data.images)) {
            await this.#ingestImages(data.images);
        }

        // 2. Prepare the creation
        // We might want to generate a new ID if we don't want to override existing ones, 
        // but the requirement says "not override or add them" only for preset assets.
        // For the creation itself, we usually want to treat it as a new creation or allow overriding.
        // Let's assume we want to preserve the creation as it was.
        
        const creationData = data.creation;
        const creation = new Creation(creationData.id, creationData, this.#deps);

        // 3. Save creation
        await this.#deps.creationRepository.save(creation);

        return creation;
    }

    /**
     * Ingests images into the local database, respecting existing preset assets.
     * @param {Array<Object>} images
     * @returns {Promise<void>}
     * @private
     */
    async #ingestImages(images) {
        for (const imageData of images) {
            // Check if it already exists in any repository
            const existingImage = await this.#deps.imageRepository.get(imageData.id);
            const existingBackground = await this.#deps.backgroundRepository.get(imageData.id);
            const existingPreset = await this.#deps.imagePresetRepository.get(imageData.id);

            if (existingImage || existingBackground || existingPreset) {
                // If it already exists in the user's instance (as a normal image or a preset), don't override
                continue;
            }

            // Convert Base64 back to Blob if needed
            let imageBlob = imageData.imageBlob;
            if (typeof imageBlob === 'string' && imageBlob.startsWith('data:')) {
                imageBlob = await this.#base64ToBlob(imageBlob);
            }

            // Create and save new image asset into the image library (not as a preset)
            const image = new Image(imageData.id, imageBlob, imageData.category || 'image', this.#deps);
            await this.#deps.imageRepository.save(image);
        }
    }

    /**
     * Converts a Base64 data URL string to a Blob.
     * @param {string} base64
     * @returns {Promise<Blob>}
     * @private
     */
    async #base64ToBlob(base64) {
        const response = await fetch(base64);
        return await response.blob();
    }

    /**
     * Triggers a file upload dialog and processes the selected JSON file.
     * @returns {Promise<Creation>}
     */
    async uploadImport() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const json = e.target.result;
                        const creation = await this.importFromJson(json);
                        resolve(creation);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = () => reject(new Error('File reading failed'));
                reader.readAsText(file);
            };

            input.click();
        });
    }
}
