import { Dependencies } from '../util/dependencies.mjs';
import { Creation } from '../model/creation.mjs';

/**
 * Service to export a creation and its associated images as a JSON string.
 */
export class ExportAsJson {
    /** @type {Dependencies} */
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Exports a creation and all its associated image assets to a JSON string.
     * @param {string} creationId
     * @returns {Promise<string>}
     */
    async exportToJson(creationId) {
        const creation = await this.#deps.creationRepository.get(creationId, this.#deps);
        if (!creation) {
            throw new Error(`Creation with ID ${creationId} not found`);
        }

        const imageIds = this.#collectImageIds(creation);
        const images = await this.#fetchImages(imageIds);

        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            creation: this.#stripDependencies(creation),
            images: images
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Collects all image IDs from the creation (background and image layers).
     * @param {Creation} creation
     * @returns {string[]}
     * @private
     */
    #collectImageIds(creation) {
        const ids = new Set();
        if (creation.backgroundImageId) {
            ids.add(creation.backgroundImageId);
        }

        for (const layer of creation.layers) {
            if (layer.type === 'image' && layer.imageId) {
                ids.add(layer.imageId);
            }
        }

        return Array.from(ids);
    }

    /**
     * Fetches all image records for the given IDs and converts Blobs to Base64 strings.
     * @param {string[]} imageIds
     * @returns {Promise<Object[]>}
     * @private
     */
    async #fetchImages(imageIds) {
        const images = [];
        for (const id of imageIds) {
            let imageData = null;
            const image = await this.#deps.imageRepository.get(id);
            if (image) {
                imageData = {
                    id: image.id,
                    imageBlob: image.imageBlob,
                    category: image.category
                };
            } else {
                // Also check backgrounds store just in case it's a preset
                const background = await this.#deps.backgroundRepository.get(id);
                if (background) {
                    imageData = background;
                } else {
                    // Check image presets store
                    const preset = await this.#deps.imagePresetRepository.get(id);
                    if (preset) {
                        imageData = preset;
                    }
                }
            }

            if (imageData && imageData.imageBlob instanceof Blob) {
                imageData.imageBlob = await this.#blobToBase64(imageData.imageBlob);
                images.push(imageData);
            } else if (imageData) {
                // Already a string or no blob
                images.push(imageData);
            }
        }
        return images;
    }

    /**
     * Converts a Blob to a Base64 string.
     * @param {Blob} blob
     * @returns {Promise<string>}
     * @private
     */
    async #blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Removes circular dependencies or internal symbols before serialization.
     * @param {Creation} creation
     * @returns {Object}
     * @private
     */
    #stripDependencies(creation) {
        const data = JSON.parse(JSON.stringify(creation));
        // Ensure we don't include any symbols or methods accidentally
        return data;
    }

    /**
     * Triggers a browser download of the exported JSON.
     * @param {string} creationId
     * @param {string} [filename]
     */
    async downloadExport(creationId, filename) {
        const json = await this.exportToJson(creationId);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const creation = await this.#deps.creationRepository.get(creationId);
        const name = filename || `${creation?.title || 'creation'}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
