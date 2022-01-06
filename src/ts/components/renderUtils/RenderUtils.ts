import { TweenMax } from "gsap";
import { Container } from "pixi.js";
import { stageService } from "playa-core";

/**
 * RenderUtils
 */
export class RenderUtils {
    private static instance: RenderUtils;

    private static preloaded: any[] = [];

    static getInstance(): RenderUtils {
        if (!RenderUtils.instance) {
            RenderUtils.instance = new RenderUtils();
        }

        return RenderUtils.instance;
    }

    /**
     * preloadObject
     * @param container
     */
    public preloadObject(
        object: Container | PIXI.DisplayObject | PIXI.Graphics | PIXI.BaseTexture | PIXI.Texture | PIXI.Text,
    ): void {
        // Grab the renderer
        const { renderer } = stageService.get(0);
        // Push to preloaded array, so we can stagger preloading
        RenderUtils.preloaded.push(object);
        // Pre-upload textures based on the array length
        // That way we are not pushing everything into the GPU at once
        TweenMax.delayedCall(RenderUtils.preloaded.length * 0.2, () => {
            // Pre-upload textures for everything in this container
            renderer.plugins.prepare.add(object);
            // Start the intro animation once the textures are all uploaded
            renderer.plugins.prepare.upload(object);
        });
    }
}
