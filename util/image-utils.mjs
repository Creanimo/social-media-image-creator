/**
 * Utility for image-related operations and checks.
 */
export class ImageUtils {
    /**
     * Checks if an image is croppable based on its type or name.
     * Currently only JPG and PNG are considered croppable.
     * @param {File|Blob|{name?: string, imageBlob?: Blob}} imageOrBlob
     * @returns {boolean}
     */
    static isCroppable(imageOrBlob) {
        let type = '';
        let name = '';

        if (imageOrBlob instanceof Blob || imageOrBlob instanceof File) {
            type = imageOrBlob.type;
            if (imageOrBlob instanceof File) {
                name = imageOrBlob.name;
            }
        } else if (imageOrBlob && typeof imageOrBlob === 'object') {
            if (imageOrBlob.imageBlob instanceof Blob) {
                type = imageOrBlob.imageBlob.type;
            }
            name = imageOrBlob.name || '';
        }

        const croppableTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (type && croppableTypes.includes(type)) {
            return true;
        }

        // Fallback to extension check if type is missing or generic
        if (name) {
            const ext = name.split('.').pop().toLowerCase();
            const croppableExtensions = ['jpg', 'jpeg', 'png'];
            if (croppableExtensions.includes(ext)) {
                return true;
            }
        }

        return false;
    }
}
