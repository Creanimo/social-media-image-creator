/**
 * Service to resolve logo IDs based on the naming convention [theme]-[size]-[variation].
 * This ensures that if a creation is opened with a logo ID that doesn't exist in the current instance,
 * it falls back to the best available match.
 */
export class LogoResolverService {
    /**
     * Resolves the requested logo ID to the best available logo ID.
     * @param {string} requestedId - The ID stored in the LogoLayer.
     * @param {Array<{id: string}>} availableLogos - List of available logos from the repository.
     * @returns {string|null} The resolved logo ID, or null if no logos are available.
     */
    resolveLogoId(requestedId, availableLogos) {
        if (!availableLogos || availableLogos.length === 0) {
            return null;
        }

        // 1. Exact match
        const exactMatch = availableLogos.find(logo => logo.id === requestedId);
        if (exactMatch) {
            return exactMatch.id;
        }

        // 2. Fallback logic based on naming convention [theme]-[size]-[variation]
        const requestedParts = requestedId ? requestedId.split('-') : [];
        if (requestedParts.length === 3) {
            const [requestedTheme, requestedSize] = requestedParts;

            // 2a. Same theme and size
            const sameThemeAndSize = availableLogos.filter(logo => {
                const parts = logo.id.split('-');
                return parts.length === 3 && parts[0] === requestedTheme && parts[1] === requestedSize;
            });
            if (sameThemeAndSize.length > 0) {
                return this.#getBestVariation(sameThemeAndSize);
            }

            // 2b. Same theme, different size
            const sameTheme = availableLogos.filter(logo => {
                const parts = logo.id.split('-');
                return parts.length === 3 && parts[0] === requestedTheme;
            });
            if (sameTheme.length > 0) {
                return this.#getBestVariation(sameTheme);
            }
        }

        // 3. Final fallback: first available logo
        return availableLogos.length > 0 ? availableLogos[0].id : null;
    }

    /**
     * Returns the ID of the logo with the highest variation number.
     * @param {Array<{id: string}>} logos
     * @returns {string}
     * @private
     */
    #getBestVariation(logos) {
        return [...logos].sort((a, b) => {
            const varA = a.id.split('-')[2] || '';
            const varB = b.id.split('-')[2] || '';
            return varB.localeCompare(varA);
        })[0].id;
    }
}
