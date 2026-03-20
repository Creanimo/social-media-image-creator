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
    /** @type {import('../repository/background-repository.mjs').BackgroundRepository} */
    backgroundRepository;
    /** @type {import('../repository/image-preset-repository.mjs').ImagePresetRepository} */
    imagePresetRepository;
    /** @type {import('../repository/preset-creation-repository.mjs').PresetCreationRepository} */
    presetCreationRepository;
    /** @type {import('../repository/thumbnail-repository.mjs').ThumbnailRepository} */
    thumbnailRepository;
    /** @type {import('./image-url-manager.mjs').ImageUrlManager} */
    imageUrlManager;
    /** @type {import('./preferences.mjs').Preferences} */
    preferences;
    /** @type {import('./category-utils.mjs').CategoryUtils} */
    categoryUtils;

    // Services
    /** @type {import('../service/image-service.mjs').ImageService} */
    imageService;
    /** @type {import('../service/layer-factory.mjs').LayerFactory} */
    layerFactory;
    /** @type {import('../service/export-as-image.mjs').ExportAsImage} */
    exportAsImage;
    /** @type {import('../service/export-as-json.mjs').ExportAsJson} */
    exportAsJson;
    /** @type {import('../service/import-json.mjs').ImportJson} */
    importJson;
    /** @type {import('../service/asset-ingest-service.mjs').AssetIngestService} */
    assetIngestService;
    /** @type {import('../service/thumbnail-service.mjs').ThumbnailService} */
    thumbnailService;
    /** @type {import('../service/modal-manager.mjs').ModalManager} */
    modalManager;

    /** @type {import('../controller/font-style-controller.mjs').FontStyleController} */
    fontStyleController;
    /** @type {import('../controller/callout-style-controller.mjs').CalloutStyleController} */
    calloutStyleController;

    /**
     * @param {Object} deps
     * @param {import('./id-generator.mjs').IdGenerator} [deps.idGenerator]
     * @param {import('./database.mjs').Database} [deps.database]
     * @param {import('../repository/image-repository.mjs').ImageRepository} [deps.imageRepository]
     * @param {import('../repository/creation-repository.mjs').CreationRepository} [deps.creationRepository]
     * @param {import('../repository/background-repository.mjs').BackgroundRepository} [deps.backgroundRepository]
     * @param {import('../repository/image-preset-repository.mjs').ImagePresetRepository} [deps.imagePresetRepository]
     * @param {import('../repository/preset-creation-repository.mjs').PresetCreationRepository} [deps.presetCreationRepository]
     * @param {import('../repository/thumbnail-repository.mjs').ThumbnailRepository} [deps.thumbnailRepository]
     * @param {import('./image-url-manager.mjs').ImageUrlManager} [deps.imageUrlManager]
     * @param {import('./preferences.mjs').Preferences} [deps.preferences]
     * @param {import('./category-utils.mjs').CategoryUtils} [deps.categoryUtils]
     * @param {import('../service/image-service.mjs').ImageService} [deps.imageService]
     * @param {import('../service/layer-factory.mjs').LayerFactory} [deps.layerFactory]
     * @param {import('../service/export-as-image.mjs').ExportAsImage} [deps.exportAsImage]
     * @param {import('../service/export-as-json.mjs').ExportAsJson} [deps.exportAsJson]
     * @param {import('../service/import-json.mjs').ImportJson} [deps.importJson]
     * @param {import('../service/asset-ingest-service.mjs').AssetIngestService} [deps.assetIngestService]
     * @param {import('../service/thumbnail-service.mjs').ThumbnailService} [deps.thumbnailService]
     * @param {import('../service/modal-manager.mjs').ModalManager} [deps.modalManager]
     * @param {import('../controller/font-style-controller.mjs').FontStyleController} [deps.fontStyleController]
     * @param {import('../controller/callout-style-controller.mjs').CalloutStyleController} [deps.calloutStyleController]
     */
    constructor({ 
        idGenerator, database, imageRepository, creationRepository, 
        backgroundRepository, imagePresetRepository, presetCreationRepository, thumbnailRepository, imageUrlManager, 
        preferences, categoryUtils, imageService, layerFactory, exportAsImage, 
        exportAsJson, importJson, assetIngestService, thumbnailService, modalManager,
        fontStyleController, calloutStyleController
    } = {}) {
        this.idGenerator = idGenerator;
        this.database = database;
        this.imageRepository = imageRepository;
        this.creationRepository = creationRepository;
        this.backgroundRepository = backgroundRepository;
        this.imagePresetRepository = imagePresetRepository;
        this.presetCreationRepository = presetCreationRepository;
        this.thumbnailRepository = thumbnailRepository;
        this.imageUrlManager = imageUrlManager;
        this.preferences = preferences;
        this.categoryUtils = categoryUtils;
        this.imageService = imageService;
        this.layerFactory = layerFactory;
        this.exportAsImage = exportAsImage;
        this.exportAsJson = exportAsJson;
        this.importJson = importJson;
        this.assetIngestService = assetIngestService;
        this.thumbnailService = thumbnailService;
        this.modalManager = modalManager;
        this.fontStyleController = fontStyleController;
        this.calloutStyleController = calloutStyleController;
    }
}
