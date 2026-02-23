import { immerable } from "immer";
import { Dependencies } from "../util/dependencies.mjs";

export class Image {
    [immerable] = true

    /** @type {string} **/
    id
    /** @type {string} **/
    imageBlob;
    /** @type {'background'|'image'} **/
    category;

    /**
     * @param {string|null} id
     * @param {string} imageBlob
     * @param {'background'|'image'} [category='background']
     * @param {Dependencies} [deps]
     */
    constructor(id, imageBlob, category = 'background', deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        this.imageBlob = imageBlob;
        this.category = category;
    }
}