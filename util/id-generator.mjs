/**
 * Simple ID generator utility.
 */
export class IdGenerator {
    /**
     * Generates a random unique-ish ID.
     * @returns {string}
     */
    generate() {
        return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }
}
