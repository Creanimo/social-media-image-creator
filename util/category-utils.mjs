/**
 * Utility to normalize gallery tab IDs to model categories.
 */
export class CategoryUtils {
    /**
     * Normalizes a gallery tab ID or category to its singular form.
     * @param {string} category - e.g., 'backgrounds' or 'images'
     * @returns {'background'|'image'|string} Singular category
     */
    static normalize(category) {
        if (category === 'backgrounds') return 'background';
        if (category === 'images') return 'image';
        return category;
    }
}
