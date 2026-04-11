/**
 * Simple hash-based router.
 */
export class Router {
    #routes;
    #currentRoute;
    #window;

    /**
     * @param {Window} [win] Optional window object for testing (dependency injection)
     */
    constructor(win = window) {
        this.#routes = new Map();
        this.#currentRoute = null;
        this.#window = win;

        this.#window.addEventListener('hashchange', () => this.#handleHashChange());
    }

    /**
     * Adds a route to the router.
     * @param {string} path 
     * @param {Function} handler 
     */
    addRoute(path, handler) {
        this.#routes.set(path, handler);
    }

    /**
     * Starts the router and handles the initial hash.
     */
    start() {
        this.#handleHashChange();
    }

    /**
     * Navigates to a specific path.
     * @param {string} path 
     */
    navigate(path) {
        if (this.#window.location.hash === path) {
            this.#handleHashChange();
        } else {
            this.#window.location.hash = path;
        }
    }

    #handleHashChange() {
        const hash = this.#window.location.hash || '#gallery';
        if (this.#window.location.hash === '' && hash === '#gallery') {
            this.navigate('#gallery');
            return;
        }
        // Extract the base path (the part before the '?')
        const basePath = hash.split('?')[0];
        const handler = this.#routes.get(basePath);

        if (handler) {
            this.#currentRoute = hash;
            handler();
        } else {
            console.warn(`No handler found for route: ${basePath}`);
            // Default to gallery if route not found
            if (basePath !== '#gallery') {
                this.navigate('#gallery');
            }
        }
    }

    get currentRoute() {
        return this.#currentRoute;
    }
}
