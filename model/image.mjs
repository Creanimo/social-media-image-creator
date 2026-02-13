import { immerable } from "immer";
import { Dependencies } from "../util/dependencies.mjs";

export class Image {
    [immerable] = true

    /** @type {string} **/
    id
    /** @type {string} **/
    imageBlob;

    /**
     * @param {string|null} id
     * @param {string} imageBlob
     * @param {Dependencies} [deps]
     */
    constructor(id, imageBlob, deps = null) {
        this.id = id || (deps?.idGenerator ? deps.idGenerator.generate() : null);
        this.imageBlob = imageBlob;
    }
}