/**
 * Container for application dependencies to be injected into models and services.
 */
export class Dependencies {
    /** @type {import('./id-generator.mjs').IdGenerator} */
    idGenerator;
    /** @type {import('./database.mjs').Database} */
    database;
    /** @type {import('../repository/image-repository.mjs').ImageRepository} */
    imageRepository;
    /** @type {import('../repository/creation-repository.mjs').CreationRepository} */
    creationRepository;
    /** @type {import('./image-url-manager.mjs').ImageUrlManager} */
    imageUrlManager;

    /**
     * @param {Object} deps
     * @param {import('./id-generator.mjs').IdGenerator} [deps.idGenerator]
     * @param {import('./database.mjs').Database} [deps.database]
     * @param {import('../repository/image-repository.mjs').ImageRepository} [deps.imageRepository]
     * @param {import('../repository/creation-repository.mjs').CreationRepository} [deps.creationRepository]
     * @param {import('./image-url-manager.mjs').ImageUrlManager} [deps.imageUrlManager]
     */
    constructor({ idGenerator, database, imageRepository, creationRepository, imageUrlManager } = {}) {
        this.idGenerator = idGenerator;
        this.database = database;
        this.imageRepository = imageRepository;
        this.creationRepository = creationRepository;
        this.imageUrlManager = imageUrlManager;
    }
}
