import { immerable } from "immer";
import { Dependencies } from "../util/dependencies.mjs";

export class Image {
    [immerable] = true

    /** @type {string} **/
    id
    /** @type {string} **/
    name;
    /** @type {string} **/
    imageBlob;
    /** @type {'background'|'image'} **/
    category;

    /**
     * @param {string|null} id
     * @param {string} imageBlob
     * @param {'background'|'image'} [category='background']
     * @param {string} [name='Untitled']
     * @param {Dependencies} [deps]
     */
    constructor(id, imageBlob, category = 'background', name = 'Untitled', deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        this.name = name;
        this.imageBlob = imageBlob;
        this.category = category;
    }

    /**
     * @returns {Object} Plain data object for storage
     */
    toData() {
        return {
            id: this.id,
            name: this.name,
            imageBlob: this.imageBlob,
            category: this.category
        };
    }
}