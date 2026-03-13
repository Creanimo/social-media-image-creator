import Mustache from 'mustache';

/**
 * Service for generating and managing thumbnails.
 */
export class ThumbnailService {
    /** @type {Dependencies} */
    #deps;
    #renderIframe;
    #renderPromise;

    /**
     * @param {Dependencies} deps
     */
    constructor(deps) {
        this.#deps = deps;
        this.#renderIframe = null;
        this.#renderPromise = null;
    }

    /**
     * Ensures a thumbnail exists and is up to date for a creation.
     * @param {Creation} creation 
     * @returns {Promise<string>} Object URL for the thumbnail
     */
    async getThumbnailUrl(creation) {
        let needsRegeneration = false;

        if (!creation.thumbnailId) {
            needsRegeneration = true;
        } else {
            const thumbnailBlob = await this.#deps.thumbnailRepository.get(creation.thumbnailId);
            if (!thumbnailBlob) {
                needsRegeneration = true;
            } else {
                // If it's a regular creation (not a preset), check lastEdited
                // Actually, the issue says: "If the creations weren't edited do not create the thumbnail again but use the existing."
                // For presets, they have a lastEdited from ingestion.
                
                // We can't easily check if the thumbnail is older than lastEdited without storing the thumbnail's own timestamp.
                // But we can store the creation's lastEdited IN the thumbnail metadata or just assume if thumbnailId exists, it's valid 
                // UNLESS we just cleared it when editing.
                
                // Let's refine the logic: If creation.thumbnailId is present, we assume it's valid for THAT version of creation.
                // When a creation is edited and saved, we should probably clear its thumbnailId or update lastEdited.
                // The repository now updates lastEdited on every save.
                
                // To be safe and follow "do not create again if not edited", we need to know when the thumbnail was created.
                // Or simpler: the creation stores the ID of the thumbnail that matches its current state.
                return this.#deps.imageUrlManager.createUrl(creation.thumbnailId, thumbnailBlob);
            }
        }

        if (needsRegeneration) {
            const blob = await this.generateThumbnail(creation);
            const thumbnailId = `thumb-${creation.id}-${Date.now()}`;
            await this.#deps.thumbnailRepository.save(thumbnailId, blob);
            
            // Update creation with the new thumbnailId
            const updatedCreation = creation.withThumbnailId(thumbnailId);
            
            // Determine which repository to use
            const isPreset = await this.#deps.presetCreationRepository.get(creation.id);
            if (isPreset) {
                await this.#deps.presetCreationRepository.save(updatedCreation, true);
            } else {
                await this.#deps.creationRepository.save(updatedCreation, true);
            }

            return this.#deps.imageUrlManager.createUrl(thumbnailId, blob);
        }
    }

    /**
     * Generates a thumbnail for a creation.
     * @param {Creation} creation 
     * @returns {Promise<Blob>}
     */
    async generateThumbnail(creation) {
        // Use #renderPromise as a lock/queue
        const previousPromise = this.#renderPromise || Promise.resolve();
        this.#renderPromise = previousPromise.then(() => this.#doGenerateThumbnail(creation));
        return this.#renderPromise;
    }

    /**
     * @param {Creation} creation 
     * @returns {Promise<Blob>}
     */
    async #doGenerateThumbnail(creation) {
        const iframe = await this.#getRenderIframe();
        const html = await this.#prepareRenderHtml(creation);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                reject(new Error('Thumbnail generation timed out'));
            }, 5000);

            const handleMessage = async (event) => {
                if (event.source !== iframe.contentWindow) return;

                if (event.data.type === 'RENDER_READY') {
                    clearTimeout(timeout);
                    window.removeEventListener('message', handleMessage);
                    
                    // Small grace period for final browser paint/reflow
                    await new Promise(resolve => setTimeout(resolve, 100));

                    try {
                        const canvasElement = iframe.contentDocument.getElementById('canvas');
                        if (!canvasElement) {
                            reject(new Error('Canvas element not found in iframe'));
                            return;
                        }
                        
                        // Capture at low DPR for thumbnails to keep memory usage low.
                        const blob = await this.#deps.exportAsImage.exportAsPng(canvasElement, {
                            dpr: 1, 
                            backgroundColor: 'white' 
                        });
                        
                        resolve(blob);
                    } catch (err) {
                        console.error('[ThumbnailService] Error during capture:', err);
                        reject(err);
                    }
                }
            };

            window.addEventListener('message', handleMessage);
            iframe.srcdoc = html;
        });
    }

    /**
     * Prepares the HTML content for the rendering iframe.
     * @param {Creation} creation 
     * @returns {Promise<string>}
     */
    async #prepareRenderHtml(creation) {
        const bgImg = await this.#deps.imageService.getImage(creation.backgroundImageId);
        const bgSrc = bgImg ? this.#deps.imageUrlManager.createUrl(bgImg.id, bgImg.imageBlob) : '';

        const creationData = creation.toData();
        creationData.backgroundScalePercent = (creationData.backgroundScale || 1) * 100;
        
        creationData.layers = await Promise.all(creationData.layers.map(async (l, index) => {
            const mappedLayer = {
                ...l,
                index,
                isFont: l.type === 'font',
                isIcon: l.type === 'icon',
                isIconCallout: l.type === 'icon-callout',
                isImage: l.type === 'image'
            };

            if (mappedLayer.isImage && l.imageId) {
                const img = await this.#deps.imageService.getImage(l.imageId);
                if (img) {
                    mappedLayer.src = this.#deps.imageUrlManager.createUrl(img.id, img.imageBlob);
                }
            }

            return mappedLayer;
        }));

        const [
            canvasTemplate, 
            fontLayerTpl, 
            iconLayerTpl, 
            calloutLayerTpl, 
            imageLayerTpl
        ] = await Promise.all([
            fetch('view/templates/canvas.mustache').then(r => r.text()),
            fetch('view/templates/canvas-layer-font.mustache').then(r => r.text()),
            fetch('view/templates/canvas-layer-icon.mustache').then(r => r.text()),
            fetch('view/templates/canvas-layer-icon-callout.mustache').then(r => r.text()),
            fetch('view/templates/canvas-layer-image.mustache').then(r => r.text())
        ]);

        const partials = {
            'canvas-layer-font': fontLayerTpl,
            'canvas-layer-icon': iconLayerTpl,
            'canvas-layer-icon-callout': calloutLayerTpl,
            'canvas-layer-image': imageLayerTpl
        };

        return Mustache.render(canvasTemplate, {
            creation: creationData,
            bgSrc,
            fontStyleUrls: this.#deps.fontStyleController ? this.#deps.fontStyleController.getUrls() : [],
            calloutStyleUrls: this.#deps.calloutStyleController ? this.#deps.calloutStyleController.getUrls() : []
        }, partials);
    }

    async #getRenderIframe() {
        if (this.#renderIframe) return this.#renderIframe;

        this.#renderIframe = document.createElement('iframe');
        this.#renderIframe.style.position = 'fixed';
        this.#renderIframe.style.top = '-10000px';
        this.#renderIframe.style.left = '-10000px';
        this.#renderIframe.style.width = '2000px'; // Large enough for FullHD
        this.#renderIframe.style.height = '2000px';
        this.#renderIframe.style.visibility = 'hidden';
        document.body.appendChild(this.#renderIframe);

        return this.#renderIframe;
    }
}
