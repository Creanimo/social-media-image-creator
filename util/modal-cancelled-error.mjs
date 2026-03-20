/**
 * Error thrown when a modal is cancelled by the user.
 */
export class ModalCancelledError extends Error {
    constructor(message = 'Modal cancelled') {
        super(message);
        this.name = 'ModalCancelledError';
    }
}
