import { Sprite, Texture } from "pixi.js";
import { SpineAnimation, stageService, TextAutoFit } from "playa-core";

/**
 * LayoutUtils
 */
export class LayoutUtils {
    private static instance: LayoutUtils;

    static getInstance(): LayoutUtils {
        if (!LayoutUtils.instance) {
            LayoutUtils.instance = new LayoutUtils();
        }

        return LayoutUtils.instance;
    }

    public changeSpineTextureWihDifferentTexture(
        spineAnim: SpineAnimation,
        attachmentName: string,
        attachmentMeshName: string,
        newTexture: Texture,
    ) {
        const { spine } = spineAnim;
        const { skeleton } = spine;
        // make sure the attachment we need is attached to the slot we are using
        skeleton.setAttachment(attachmentName, attachmentMeshName);
        const slotIndex = skeleton.findSlotIndex(attachmentName);
        spine.hackTextureBySlotIndex(
            slotIndex,
            newTexture,
            new PIXI.Rectangle(0, 0, newTexture.width, newTexture.height),
        );
    }

    public changeSpineTextToDifferentTextTexture(
        spineAnim: SpineAnimation,
        attachmentName: string,
        attachmentMeshName: string,
        valueAmount: string,
        size: number,
        textStyle,
        positionY,
    ) {
        const { spine } = spineAnim;
        const { skeleton } = spine;
        // make sure the attachment we need is attached to the slot we are using
        skeleton.setAttachment(attachmentName, attachmentMeshName);
        const slotIndex = skeleton.findSlotIndex(attachmentName);

        const textTexture = this._generateTextTextureForSpineMesh(
            valueAmount,
            textStyle,
            size,
            {
                x: 0.5,
                y: 0.5,
            },
            { x: size / 2, y: positionY },
        );

        spine.hackTextureBySlotIndex(slotIndex, textTexture.texture, textTexture.bounds);
    }

    private _generateTextTextureForSpineMesh(
        textToTransform: string,
        textStyle: any,
        sizeConstraint: number,
        anchor: { x: number; y: number },
        position?: { x: number; y: number },
    ): { bounds: PIXI.Rectangle; texture: Texture; sprite: Sprite } {
        // the coin animations are 250 square, use this as a size for the texture to which we will draw our sprite
        const animationSquareSize = sizeConstraint;
        // Create a styled text object for the value
        const text = new TextAutoFit(textToTransform, textStyle, undefined, true);

        // create a base texture the size of the target mesh
        const renderTexture = PIXI.RenderTexture.create({ width: animationSquareSize, height: animationSquareSize });
        // since updatText() is private in pixi v5.2.4 we can use getLocalBounds to call it for us to refresh the text.texture and use the rectangle returned to size the asset
        const bounds = text.getLocalBounds(new PIXI.Rectangle());
        // get a scale factor so we can adjust the size of the text if it goes beyond our desired size
        let scale = animationSquareSize / text.width;
        // clamp it to full size if text is smaller than maxWidth
        if (scale > 1) {
            scale = 1;
        }
        // make the texture into a displayObject and set up its size / position etc..
        const textSprite = PIXI.Sprite.from(text.texture);
        textSprite.width = bounds.width * scale;
        //TODO: might need to cap the width
        if (textSprite.width > 550) {
            textSprite.width = 550;
        }
        textSprite.height = bounds.height * scale;
        if (position) {
            textSprite.position.x = position.x;
            textSprite.position.y = position.y;
        } else {
            textSprite.position.x = animationSquareSize / 2;
            textSprite.position.y = animationSquareSize / 2;
        }

        // the text needs to be centered on the X axis but raised slightly above center on the Y
        textSprite.anchor.set(anchor.x, anchor.y);
        // console.log("my width is " + textSprite.width + " , my height is " + textSprite.height);
        // render the text sprite to the base texture
        const _renderer = stageService.get(0).renderer;
        _renderer.render(textSprite, renderTexture, true);
        return {
            bounds,
            texture: renderTexture,
            sprite: textSprite,
        };
    }
}
