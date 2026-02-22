import { SettingsView } from '../view/settings-view.mjs';
import { BackgroundIngestController } from './background-ingest-controller.mjs';

export class SettingsController {
    #deps;
    #view;

    constructor(deps, container) {
        this.#deps = deps;
        this.#view = new SettingsView(container);
    }

    async init() {
        await this.#view.loadTemplates();
        this.render();
    }

    render() {
        this.#view.render();
        this.#bindEvents();
    }

    #bindEvents() {
        const container = this.#view.container;

        container.querySelector('#delete-all-btn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete all repositories? This will remove all your creations and uploaded images.')) {
                await this.#deps.database.deleteDatabase();
                alert('All repositories have been deleted. The app will reload.');
                window.location.reload();
            }
        });

        container.querySelector('#rebuild-backgrounds-btn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to rebuild the background repository?')) {
                // Clear the backgrounds store
                await this.#deps.database.clearStore('backgrounds');
                
                // Re-ingest
                const ingestController = new BackgroundIngestController(this.#deps);
                await ingestController.ingest();
                
                alert('Background repository has been rebuilt.');
            }
        });
    }
}
