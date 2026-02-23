import { Image } from '../model/image.mjs';
import { Creation } from '../model/creation.mjs';
import { ImageLayer } from '../model/image-layer.mjs';

/**
 * Shared image-related operations.
 */
export class ImageService {
    /**
     * Saves an uploaded file as an Image with the given category.
     * @param {Dependencies} deps
     * @param {File|Blob} file
     * @param {'background'|'image'} category
     * @returns {Promise<import('../model/image.mjs').Image>}
     */
    static async saveUpload(deps, file, category = 'background') {
        const img = new Image(null, file, category, deps);
        await deps.imageRepository.save(img);
        return img;
    }

    /**
     * Fetches an image by ID from either the image or background repository.
     * @param {Dependencies} deps
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    static async getImage(deps, id) {
        let img = await deps.imageRepository.get(id, deps);
        if (!img) {
            img = await deps.backgroundRepository.get(id);
        }
        return img;
    }

    /**
     * Starts a new creation from an image.
     * @param {Dependencies} deps
     * @param {string} id Image ID
     * @param {'background'|'image'} category
     * @returns {Promise<Creation>}
     */
    static async startCreationFromImage(deps, id, category) {
        const response = await fetch('/presets/template-creations/default.json');
        const defaultData = await response.json();
        
        let creationData = { ...defaultData };
        if (category === 'background') {
            creationData.backgroundImageId = id;
        }

        let newCreation = new Creation(null, creationData, deps);

        if (category === 'image') {
            const imgLayer = new ImageLayer(null, {
                name: 'Image Layer',
                imageId: id,
                slot: 'center-middle'
            }, deps);
            newCreation = newCreation.addLayer(imgLayer);
        }

        await deps.creationRepository.save(newCreation);
        return newCreation;
    }

    /**
     * Adds an image to an existing creation.
     * @param {Dependencies} deps
     * @param {Creation} creation
     * @param {string} id Image ID
     * @param {'background'|'image'} category
     * @returns {Promise<Creation>}
     */
    static async addImageToCreation(deps, creation, id, category) {
        let updatedCreation = creation;
        if (category === 'background') {
            updatedCreation = creation.withBackgroundImageId(id);
        } else {
            const imgLayer = new ImageLayer(null, {
                name: 'Image Layer',
                imageId: id,
                slot: 'center-middle'
            }, deps);
            updatedCreation = creation.addLayer(imgLayer);
        }
        await deps.creationRepository.save(updatedCreation);
        return updatedCreation;
    }
}
