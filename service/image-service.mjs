import { Image } from '../model/image.mjs';
import { Creation } from '../model/creation.mjs';
import { ImageLayer } from '../model/image-layer.mjs';

/**
 * Shared image-related operations.
 */
export class ImageService {
    /** @type {Dependencies} */
    #deps;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
    }

    /**
     * Saves an uploaded file as an Image with the given category.
     * @param {File|Blob} file
     * @param {'background'|'image'} category
     * @returns {Promise<import('../model/image.mjs').Image>}
     */
    async saveUpload(file, category = 'background') {
        const img = new Image(null, file, category, this.#deps);
        await this.#deps.imageRepository.save(img);
        return img;
    }

    /**
     * Fetches an image by ID from either the image, background or image preset repository.
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async getImage(id) {
        let img = await this.#deps.imageRepository.get(id, this.#deps);
        if (!img) {
            img = await this.#deps.backgroundRepository.get(id);
        }
        if (!img) {
            img = await this.#deps.imagePresetRepository.get(id);
        }
        return img;
    }

    /**
     * Starts a new creation from an image.
     * @param {string} id Image ID
     * @param {'background'|'image'} category
     * @returns {Promise<Creation>}
     */
    async startCreationFromImage(id, category) {
        const response = await fetch('/presets/template-creations/default.json');
        const defaultData = await response.json();
        
        let creationData = { ...defaultData };
        if (category === 'background') {
            creationData.backgroundImageId = id;
        }

        let newCreation = new Creation(null, creationData, this.#deps);

        if (category === 'image') {
            const imgLayer = new ImageLayer(null, {
                name: 'Image Layer',
                imageId: id,
                slot: 'center-middle'
            }, this.#deps);
            newCreation = newCreation.addLayer(imgLayer);
        }

        await this.#deps.creationRepository.save(newCreation);
        return newCreation;
    }

    /**
     * Adds an image to an existing creation.
     * @param {Creation} creation
     * @param {string} id Image ID
     * @param {'background'|'image'} category
     * @returns {Promise<Creation>}
     */
    async addImageToCreation(creation, id, category) {
        let updatedCreation = creation;
        if (category === 'background') {
            updatedCreation = creation.withBackgroundImageId(id);
        } else {
            const imgLayer = new ImageLayer(null, {
                name: 'Image Layer',
                imageId: id,
                slot: 'center-middle'
            }, this.#deps);
            updatedCreation = creation.addLayer(imgLayer);
        }
        await this.#deps.creationRepository.save(updatedCreation);
        return updatedCreation;
    }
}
