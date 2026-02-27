import Mustache from 'mustache';
import '/view/index.mjs';
import { Dependencies } from './util/dependencies.mjs';
import { IdGenerator } from './util/id-generator.mjs';
import { Database } from './util/database.mjs';
import { Preferences } from './util/preferences.mjs';
import { ImageUrlManager } from './util/image-url-manager.mjs';
import { ImageRepository } from './repository/image-repository.mjs';
import { CreationRepository } from './repository/creation-repository.mjs';
import { BackgroundRepository } from './repository/background-repository.mjs';
import { ImagePresetRepository } from './repository/image-preset-repository.mjs';
import { GalleryController } from './controller/gallery-controller.mjs';
import { CreationsController } from './controller/creations-controller.mjs';
import { EditorController } from './controller/editor-controller.mjs';
import { SettingsController } from './controller/settings-controller.mjs';
import { BackgroundIngestController } from './controller/background-ingest-controller.mjs';
import { ImagePresetIngestController } from './controller/image-preset-ingest-controller.mjs';
import { FontStyleController } from './controller/font-style-controller.mjs';
import { FontStyleListController } from './controller/font-style-list-controller.mjs';
import { Router } from './router/router.mjs';
import { ImportJson } from './service/import-json.mjs';

async function init() {
    // 1. Setup Dependencies
    const db = new Database();
    const deps = new Dependencies({
        idGenerator: new IdGenerator(),
        database: db,
        imageRepository: new ImageRepository(db),
        creationRepository: new CreationRepository(db),
        backgroundRepository: new BackgroundRepository(db),
        imagePresetRepository: new ImagePresetRepository(db),
        imageUrlManager: new ImageUrlManager(),
        preferences: new Preferences()
    });

    // 2. Render Base Frame
    const backgroundIngestController = new BackgroundIngestController(deps);
    const imagePresetIngestController = new ImagePresetIngestController(deps);
    const fontStyleController = new FontStyleController();
    await Promise.all([
        backgroundIngestController.ingest(),
        imagePresetIngestController.ingest(),
        fontStyleController.init()
    ]);

    const [frameTemplateResponse, fontStylesLoaderResponse] = await Promise.all([
        fetch('view/templates/frame.mustache'),
        fetch('view/templates/font-styles-loader.mustache')
    ]);

    const template = await frameTemplateResponse.text();
    const fontStylesLoaderTemplate = await fontStylesLoaderResponse.text();

    const fontStylesHtml = Mustache.render(fontStylesLoaderTemplate, {
        urls: fontStyleController.getUrls()
    });

    const frameData = {
        'font-styles': fontStylesHtml,
        'header': `
            <div class="wa-cluster" style="justify-content: space-between; align-items: center; width: 100%;">
                <h1>Social Media Image Creator</h1>
                <wa-button id="load-from-json-btn" variant="neutral" size="small">
                    <wa-icon name="file-import" library="tabler" slot="prefix"></wa-icon>
                    Load from JSON
                </wa-button>
            </div>
        `,
        'main-navigation': `
            <ul>
                <li>
                    <a class="wa-flank wa-align-items-start" href="#editor"><wa-icon name="photo-edit" library="tabler"></wa-icon><span>Editor</span></a>
                </li>
                <li>
                    <a class="wa-flank wa-align-items-start" href="#creations"><wa-icon name="library-photo" library="tabler"></wa-icon><span>My Creations</span></a>
                </li>
                <li><a class="wa-flank wa-align-items-start" href="#gallery"><wa-icon name="cloud-upload"" library="tabler"></wa-icon><span>Uploaded Images</span></a></li>
                <li><a class="wa-flank wa-align-items-start" href="#font-styles"><wa-icon name="typography" library="tabler"></wa-icon><span>Font Styles</span></a></li>
                <li><a class="wa-flank wa-align-items-start" href="#settings"><wa-icon name="settings" library="tabler"></wa-icon><span>Settings</span></a></li>
            </ul>
        `,
        'sidebar': '<div id="sidebar-content"></div>',
        'content': '<div id="main-content">Loading...</div>'
    };

    const renderedFrame = Mustache.render(template, frameData);
    document.getElementById('app').innerHTML = renderedFrame;

    // 2.5 Setup Header Button
    const importer = new ImportJson(deps);
    document.getElementById('load-from-json-btn').addEventListener('click', async () => {
        try {
            const creation = await importer.uploadImport();
            window.location.hash = `#editor?id=${creation.id}`;
            // If we are already on the editor page, we might need a manual trigger to reload
            if (window.location.hash.startsWith('#editor')) {
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
        } catch (err) {
            console.error('Import failed:', err);
            alert(`Import failed: ${err.message}`);
        }
    });

    const mainContent = document.getElementById('main-content');
    const sidebarContent = document.getElementById('sidebar-content');

    // 3. Setup Router
    const router = new Router();

    router.addRoute('#gallery', async () => {
        // Revoke all URLs when leaving a section to ensure memory is freed
        deps.imageUrlManager.revokeAll();
        sidebarContent.innerHTML = 'Gallery Info';
        const controller = new GalleryController(deps, mainContent);
        await controller.init();
    });

    router.addRoute('#creations', async () => {
        deps.imageUrlManager.revokeAll();
        sidebarContent.innerHTML = 'Creations Info';
        const controller = new CreationsController(deps, mainContent);
        await controller.init();
    });

    router.addRoute('#editor', async () => {
        console.log('[Main] Routing to #editor');
        deps.imageUrlManager.revokeAll();
        const controller = new EditorController(deps, mainContent, sidebarContent);
        await controller.init();
    });

    router.addRoute('#font-styles', async () => {
        deps.imageUrlManager.revokeAll();
        sidebarContent.innerHTML = 'Font Styles Info';
        const controller = new FontStyleListController(fontStyleController, mainContent);
        await controller.init();
    });

    router.addRoute('#settings', async () => {
        deps.imageUrlManager.revokeAll();
        sidebarContent.innerHTML = 'Settings Info';
        const controller = new SettingsController(deps, mainContent);
        await controller.init();
    });

    router.start();
}

init().catch(console.error);
