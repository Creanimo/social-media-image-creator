import { CreationsView } from '../view/creations-view.mjs';
import { Creation } from '../model/creation.mjs';

export class CreationsController {
    #deps;
    #view;

    constructor(deps, container) {
        this.#deps = deps;
        this.#view = new CreationsView(container);
    }

    async init() {
        await this.#view.loadTemplates();
        await this.refresh();
    }

    async refresh() {
        const [creations, presets] = await Promise.all([
            this.#deps.creationRepository.getAll(this.#deps),
            this.#deps.presetCreationRepository.getAll(this.#deps)
        ]);
        this.#view.render(creations, presets);
        this.#bindEvents();
    }

    #bindEvents() {
        const container = this.#view.container;

        container.querySelector('#create-new')?.addEventListener('click', async () => {
            const response = await fetch('presets/template-creations/default.json');
            const defaultData = await response.json();
            
            // Explicitly remove the preset's ID so that a new one is generated
            const { id: presetId, ...creationData } = defaultData;

            const newCreation = new Creation(
                null,
                creationData,
                this.#deps
            );
            await this.#deps.creationRepository.save(newCreation);
            window.location.hash = `#editor?id=${newCreation.id}`;
        });

        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.location.hash = `#editor?id=${id}`;
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (id) {
                    await this.#deps.creationRepository.delete(id);
                    await this.refresh();
                }
            });
        });

        container.querySelectorAll('.use-preset-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (id) {
                    const newCreation = await this.#deps.imageService.startCreationFromPreset(id);
                    window.location.hash = `#editor?id=${newCreation.id}`;
                }
            });
        });
    }
}
