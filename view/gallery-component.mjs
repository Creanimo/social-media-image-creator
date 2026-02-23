import Mustache from 'mustache';

import { CategoryUtils } from '../util/category-utils.mjs';

/**
 * Modular component for displaying an image gallery with tabs.
 */
export class GalleryComponent {
    #container;
    #deps;
    #config;
    #templates = {};
    #onSelect;
    #onDelete;
    #onUpload;
    #onStartCreation;

    /**
     * @param {HTMLElement} container
     * @param {Dependencies} deps
     * @param {Object} config
     * @param {string[]} config.tabs - List of tab IDs to display.
     * @param {boolean} [config.isModal=false] - Whether the component is used in a modal.
     * @param {Function} [config.onSelect]
     * @param {Function} [config.onDelete]
     * @param {Function} [config.onUpload]
     * @param {Function} [config.onStartCreation]
     */
    constructor(container, deps, config = {}) {
        this.#container = container;
        this.#deps = deps;
        this.#config = {
            tabs: ['backgrounds', 'images'],
            isModal: false,
            ...config
        };
        this.#onSelect = config.onSelect;
        this.#onDelete = config.onDelete;
        this.#onUpload = config.onUpload;
        this.#onStartCreation = config.onStartCreation;
    }

    /**
     * Loads the templates.
     */
    async loadTemplates() {
        const [baseRes, cardRes] = await Promise.all([
            fetch('view/templates/gallery-component.mustache'),
            fetch('view/templates/image-card.mustache')
        ]);
        this.#templates.base = await baseRes.text();
        this.#templates.card = await cardRes.text();
    }

    /**
     * Renders the gallery component.
     * @param {Object} data - Data for each tab.
     */
    async render(data) {
        // Prepare view data based on config.tabs
        const tabLabels = {
            'backgrounds': 'Backgrounds',
            'images': 'Images'
        };

        const tabsData = this.#config.tabs.map(tabId => ({
            id: tabId,
            label: tabLabels[tabId] || tabId,
            items: (data[tabId] || []).map(item => ({
                ...item,
                isGallery: !this.#config.isModal,
                isModal: this.#config.isModal
            }))
        }));

        const rendered = Mustache.render(this.#templates.base, {
            tabs: tabsData,
            initialActive: this.#config.tabs[0]
        }, {
            'image-card': this.#templates.card
        });

        this.#container.innerHTML = rendered;
        await this.#initWebComponents();
        this.#bindEvents();
    }

    async #initWebComponents() {
        await customElements.whenDefined('wa-combobox');
        const comboboxes = this.#container.querySelectorAll('.filter-combobox');
        for (const combobox of comboboxes) {
            await combobox.updateComplete;

            combobox.getTag = (option, index) => {
                const icon = option.querySelector('wa-icon[slot="start"]');
                const name = icon.name;
                const library = icon.library || 'default';

                return `
                    <wa-tag with-remove data-value="${option.value}">
                        <wa-icon name="${name}" library="${library}"></wa-icon>
                        ${option.label}
                    </wa-tag>
                `;
            };
        }
    }

    #bindEvents() {
        const container = this.#container;

        // Upload triggers
        const uploadButtons = container.querySelectorAll('.upload-trigger');
        const fileInput = container.querySelector('.image-upload-input');

        uploadButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                fileInput.setAttribute('data-target-category', btn.getAttribute('data-category'));
                fileInput?.click();
            });
        });

        fileInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const category = fileInput.getAttribute('data-target-category');
            if (file && this.#onUpload) {
                const state = this.getState();
                // Normalize category from tab id (e.g., "backgrounds" -> "background")
                const normalizedCategory = CategoryUtils.normalize(category);
                await this.#onUpload(file, normalizedCategory);
                e.target.value = '';
                fileInput.removeAttribute('data-target-category');
                // The controller will typically call refresh() which calls render() and restoreState()
                // But if the controller doesn't, we might need to handle it.
                // In both current controllers, refresh() is called.
            }
        });

        // Filtering
        const filterComboboxes = container.querySelectorAll('.filter-combobox');
        filterComboboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.#applyFilters();
            });
        });

        // Select buttons
        const selectButtons = container.querySelectorAll('.select-image-btn');
        selectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const panel = btn.closest('wa-tab-panel');
                const tabId = panel?.getAttribute('name');
                if (id && this.#onSelect) {
                    this.#onSelect(id, tabId);
                }
            });
        });

        // Delete buttons
        const deleteButtons = container.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (id && this.#onDelete) {
                    await this.#onDelete(id);
                }
            });
        });

        // Start creation buttons
        const startCreationButtons = container.querySelectorAll('.start-creation-btn');
        startCreationButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const category = btn.getAttribute('data-category');
                if (id && this.#onStartCreation) {
                    await this.#onStartCreation(id, category);
                }
            });
        });

        // Apply initial filters
        this.#applyFilters();
    }

    #applyFilters() {
        const container = this.#container;
        const filterComboboxes = container.querySelectorAll('.filter-combobox');
        const filtersByCategory = {};
        filterComboboxes.forEach(cb => {
            let values = cb.value;
            if (!Array.isArray(values)) {
                values = typeof values === 'string' && values.length ? values.split(',') : [];
            }
            filtersByCategory[cb.getAttribute('data-category')] = values;
        });

        const lists = container.querySelectorAll('.gallery-list');
        lists.forEach(list => {
            const category = list.getAttribute('data-category');
            const activeFilters = filtersByCategory[category] || [];
            const cards = list.querySelectorAll('wa-card');
            
            cards.forEach(card => {
                const source = card.getAttribute('data-source') || 'my-uploads';
                const visible = activeFilters.includes(source);
                card.style.display = visible ? 'block' : 'none';
            });
        });
    }

    /**
     * Refreshes the active tab and filters from DOM.
     * @returns {Object} State to restore.
     */
    getState() {
        const container = this.#container;
        const activeTabValue = container.querySelector('wa-tab-group')?.active;
        const filterValues = {};
        container.querySelectorAll('.filter-combobox').forEach(cb => {
            filterValues[cb.getAttribute('data-category')] = cb.value;
        });
        return { activeTabValue, filterValues };
    }

    /**
     * Restores the tab and filters state.
     * @param {Object} state
     */
    async restoreState(state) {
        if (!state) return;
        const container = this.#container;
        const { activeTabValue, filterValues } = state;

        if (activeTabValue) {
            const tabGroup = container.querySelector('wa-tab-group');
            if (tabGroup) {
                await tabGroup.updateComplete;
                tabGroup.active = activeTabValue;
            }
        }

        const comboboxes = Array.from(container.querySelectorAll('.filter-combobox'));
        await Promise.all(comboboxes.map(cb => cb.updateComplete));

        comboboxes.forEach(cb => {
            const cat = cb.getAttribute('data-category');
            if (filterValues[cat]) {
                cb.value = filterValues[cat];
            }
        });

        this.#applyFilters();
    }
}
