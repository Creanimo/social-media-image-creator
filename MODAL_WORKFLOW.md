### Modal Workflow and Data Passing

The application uses a modular modal system to handle complex user interactions like adding layers and picking/cropping images.

#### 1. Components
- **Modal (Base)**: `view/modal.mjs` - Provides basic `open()`, `hide()`, `submit()`, and `cancel()` functionality. It automatically requests a unique container from `ModalManager` if none is provided.
- **ModalManager**: `service/modal-manager.mjs` - Manages the creation and removal of unique DOM containers for modals to prevent interference between sequential or nested modals.
- **GalleryFlow**: `controller/gallery-flow.mjs` - Orchestrates the flow between picking an image from the gallery and cropping it.
- **GalleryModal**: `view/gallery-modal.mjs` - Shows the gallery with tabs for backgrounds and images. Modals should be re-instantiated for each use to ensure a fresh container from `ModalManager`.
- **CropModal**: `view/crop-modal.mjs` - Provides the cropping interface using `vanilla-image-cropper`.
- **AddLayerModal**: `view/add-layer-modal.mjs` - Initial selection of layer type.

#### 2. Workflow: Adding an Image Layer
1.  **Trigger**: User clicks "Add Layer" in the editor sidebar.
2.  **AddLayerModal**:
    - `EditorController` instantiates and opens `AddLayerModal`.
    - User selects "Image Layer".
    - `AddLayerModal` resolves with `'image'`.
    - `EditorController` explicitly calls `await addLayerModal.hide()`.
3.  **GalleryFlow Initiation**:
    - `EditorController` calls `galleryFlow.open(['images'], 'layer', callback)`.
    - `GalleryFlow` sets an `#isOpen` guard to prevent concurrent executions.
4.  **GalleryModal**:
    - `GalleryFlow` instantiates and opens `GalleryModal`.
    - User either selects an existing image or uploads a new one.
5.  **Transition to Cropping**:
    - If selecting an existing image:
        - `GalleryFlow` fetches the image blob.
        - `GalleryFlow` calls `await galleryModal.hide()`.
        - `GalleryFlow` instantiates and calls `cropModal.show(image)`.
    - If uploading a new file:
        - `GalleryFlow` calls `await galleryModal.hide()`.
        - `GalleryFlow` instantiates and calls `cropModal.show(file)`.
6.  **Cropping**:
    - User crops the image and clicks "Save as New" or "Override".
    - `CropModal` resolves with the cropped blob and mode.
    - `GalleryFlow` saves the image via `imageService`.
7.  **Application**:
    - `GalleryFlow` calls the `onApply` callback provided by `EditorController`.
    - `EditorController` adds the new image layer to the creation and updates the view.
8.  **Cancellation**:
    - If the user cancels the `CropModal`, `GalleryFlow` automatically re-opens the `GalleryModal` by calling its internal `#run()` method (maintaining the `#isOpen` state).

#### 3. Data Integrity and Lifecycle
- **Unique Containers**: Each modal instance gets its own container from `ModalManager`. This allows multiple modals to exist in the DOM (e.g., nested or transitioning) without clearing each other's content.
- **Instance Lifecycle**: Modals SHOULD be re-instantiated every time they are shown. This is because `Modal.mjs` removes its container when it is hidden (if it owns it), so a reused instance would attempt to use a non-existent container.
- **Async Safety**: `Modal.hide()` waits for the `wa-after-hide` event from the Web Component to ensure any animations are finished and the instance is ready to be cleaned up.
- **State Management**: `GalleryFlow` encapsulates its own state (`target`, `onApply`) during a single flow execution, ensuring that subsequent calls to `open()` don't interfere with an active session (until it's finished).
