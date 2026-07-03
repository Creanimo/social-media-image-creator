/**
 * Utility to normalize gallery tab IDs to model categories.
 */
export class CategoryUtils {
    /**
     * Normalizes a gallery tab ID or category to its singular form.
     * @param {string} category - e.g., 'backgrounds', 'images' or 'logos'
     * @returns {'background'|'image'|'logo'|string} Singular category
     */
    normalize(category) {
        if (category === 'backgrounds') return 'background';
        if (category === 'images') return 'image';
        if (category === 'logos') return 'logo';
        return category;
    }
}
