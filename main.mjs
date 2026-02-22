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
import { GalleryController } from './controller/gallery-controller.mjs';
import { CreationsController } from './controller/creations-controller.mjs';
import { EditorController } from './controller/editor-controller.mjs';
import { SettingsController } from './controller/settings-controller.mjs';
import { BackgroundIngestController } from './controller/background-ingest-controller.mjs';
import { FontStyleController } from './controller/font-style-controller.mjs';
import { FontStyleListController } from './controller/font-style-list-controller.mjs';
import { Router } from './router/router.mjs';

async function init() {
    // 1. Setup Dependencies
    const db = new Database();
    const deps = new Dependencies({
        idGenerator: new IdGenerator(),
        database: db,
        imageRepository: new ImageRepository(db),
        creationRepository: new CreationRepository(db),
        backgroundRepository: new BackgroundRepository(db),
        imageUrlManager: new ImageUrlManager(),
        preferences: new Preferences()
    });

    // 2. Render Base Frame
    const backgroundIngestController = new BackgroundIngestController(deps);
    const fontStyleController = new FontStyleController();
    await Promise.all([
        backgroundIngestController.ingest(),
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
        'header': '<h1>Social Media Image Creator</h1>',
        'main-navigation': `
            <ul>
                <li><a href="#gallery">Gallery</a></li>
                <li><a href="#creations">My Creations</a></li>
                <li><a href="#editor">Editor</a></li>
                <li><a href="#font-styles">Font Styles</a></li>
                <li><a href="#settings">Settings</a></li>
            </ul>
        `,
        'sidebar': '<div id="sidebar-content">Settings</div>',
        'content': '<div id="main-content">Loading...</div>'
    };

    const renderedFrame = Mustache.render(template, frameData);
    document.getElementById('app').innerHTML = renderedFrame;

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
