import { expect } from '../node_modules/chai/index.js';
import { Database } from '../util/database.mjs';
import { Dependencies } from '../util/dependencies.mjs';
import { ImportJson } from '../service/import-json.mjs';
import { CreationRepository } from '../repository/creation-repository.mjs';
import { ImageRepository } from '../repository/image-repository.mjs';
import { BackgroundRepository } from '../repository/background-repository.mjs';
import { ImagePresetRepository } from '../repository/image-preset-repository.mjs';
import { LogoRepository } from '../repository/logo-repository.mjs';
import { Creation } from '../model/creation.mjs';
import { FontLayer } from '../model/font-layer.mjs';
import { ImageLayer } from '../model/image-layer.mjs';
import { LogoLayer } from '../model/logo-layer.mjs';

describe('Import Creation Flow', () => {
    let db;
    let deps;
    let importJson;
    const testDbName = 'TestImportDB';

    beforeEach(async () => {
        db = new Database(testDbName, 1);
        await db.connect();

        const creationRepository = new CreationRepository(db);
        const imageRepository = new ImageRepository(db);
        const backgroundRepository = new BackgroundRepository(db);
        const imagePresetRepository = new ImagePresetRepository(db);
        const logoRepository = new LogoRepository(db);

        deps = new Dependencies({
            database: db,
            creationRepository,
            imageRepository,
            backgroundRepository,
            imagePresetRepository,
            logoRepository,
            idGenerator: { generate: () => 'generated-id' }
        });

        importJson = new ImportJson(deps);
    });

    afterEach(async () => {
        await db.deleteDatabase();
    });

    it('should import a creation with images and layers from JSON', async () => {
        const testImageId = 'test-image-123';
        // A simple 1x1 transparent pixel in base64
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        const importData = {
            creation: {
                id: 'creation-abc',
                title: 'Test Creation',
                width: 1080,
                height: 1080,
                layers: [
                    {
                        id: 'layer-1',
                        type: 'font',
                        name: 'Text Layer',
                        text: 'Hello World',
                        fontSize: 40,
                        visible: true,
                        zIndex: 1
                    },
                    {
                        id: 'layer-2',
                        type: 'image',
                        name: 'Image Layer',
                        imageId: testImageId,
                        visible: true,
                        zIndex: 2
                    },
                    {
                        id: 'layer-3',
                        type: 'logo',
                        name: 'Logo Layer',
                        logoId: 'logo-123',
                        visible: true,
                        zIndex: 3
                    }
                ]
            },
            images: [
                {
                    id: testImageId,
                    imageBlob: base64Image,
                    category: 'image'
                },
                {
                    id: 'logo-123',
                    imageBlob: base64Image,
                    category: 'logo'
                }
            ]
        };

        const json = JSON.stringify(importData);

        // 1. Ingest JSON and build object
        const creation = await importJson.importFromJson(json);

        // Verify the creation object
        expect(creation).to.be.instanceOf(Creation);
        expect(creation.id).to.equal('creation-abc');
        expect(creation.title).to.equal('Test Creation');
        expect(creation.layers).to.have.lengthOf(3);
        
        // Verify layers classes
        expect(creation.layers[0]).to.be.instanceOf(FontLayer);
        expect(creation.layers[0].text).to.equal('Hello World');
        
        expect(creation.layers[1]).to.be.instanceOf(ImageLayer);
        expect(creation.layers[1].imageId).to.equal(testImageId);

        expect(creation.layers[2]).to.be.instanceOf(LogoLayer);
        expect(creation.layers[2].logoId).to.equal('logo-123');

        // 2. Check if stored in DB
        // Check creation
        const storedCreation = await deps.creationRepository.get('creation-abc', deps);
        expect(storedCreation).to.not.be.null;
        expect(storedCreation.title).to.equal('Test Creation');
        
        // Check image
        const storedImage = await deps.imageRepository.get(testImageId);
        expect(storedImage).to.not.be.null;
        expect(storedImage.id).to.equal(testImageId);

        // Check logo (should be saved in imageRepository as it's not a preset)
        const storedLogo = await deps.imageRepository.get('logo-123');
        expect(storedLogo).to.not.be.null;
        expect(storedLogo.category).to.equal('logo');
    });

    it('should throw error if creation data is missing', async () => {
        const invalidJson = JSON.stringify({ images: [] });
        
        try {
            await importJson.importFromJson(invalidJson);
            expect.fail('Should have thrown an error');
        } catch (error) {
            expect(error.message).to.equal('Invalid JSON: missing creation data');
        }
    });

    it('should not override existing images', async () => {
        const testImageId = 'existing-image-123';
        const initialBlob = new Blob(['initial content'], { type: 'text/plain' });
        
        // Pre-save an image
        const initialImage = { id: testImageId, imageBlob: initialBlob, category: 'image', name: 'Original' };
        await deps.imageRepository.save(initialImage);

        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const importData = {
            creation: { id: 'c1', title: 'C1', layers: [] },
            images: [{ id: testImageId, imageBlob: base64Image, category: 'image' }]
        };

        await importJson.importFromJson(JSON.stringify(importData));

        // Verify image was NOT overridden
        const storedImage = await deps.imageRepository.get(testImageId);
        // It won't be the base64-converted one, but our initial dummy blob
        expect(storedImage.imageBlob.size).to.equal(initialBlob.size);
    });
});
