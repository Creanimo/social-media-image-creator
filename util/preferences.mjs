/**
 * Utility for managing user preferences using localStorage.
 */
export class Preferences {
    /**
     * @param {string} key
     * @param {any} defaultValue
     * @returns {any}
     */
    get(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        if (value === null) {
            return defaultValue;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    /**
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
    }
}
