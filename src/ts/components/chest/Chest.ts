import { TimelineMax, TweenMax } from "gsap";
import {
    BaseView,
    currencyService,
    ParentDef,
    soundManager,
    SpineAnimation,
    TextAutoFit,
    translationService,
} from "playa-core";
import { iwProps } from "playa-iw";

export enum ChestTiers {
    TIER_1,
    TIER_2,
    TIER_3,
}
/**
 * Chest
 * used to represent chest winning visuals
 */
export class Chest extends BaseView<any, null, any, null> {
    private _chestAnim!: SpineAnimation;

    private _chestAnimBG!: SpineAnimation;

    private _onComplete;

    private _winAmount!: number;

    private static chestIntroAnimationName = "Chest/chestIntro";

    private static chestOpeningAnimationName = "Chest/chestOpen";

    private static chestOpendedLoopAnimationName = "Chest/chestIdleOpen";

    private static chestOutroAnimationName = "Chest/chestOutro";

    private static chestBackgroundIntroAnimationName = "Fade/FadeIntro";

    private static chestBackgroundOutroAnimationName = "Fade/FadeOutro";

    private static chestBackgroundStaticAnimationName = "Fade/FadeStatic";

    private _pulseTextTimeline;

    private _winAmountText;

    private _chestValueContainer;

    private _textStyle;

    private _destinationX = 0;

    private _destinationY = 0;

    private _sourceX;

    private _sourceY;

    public constructor(layoutId: string) {
        super(new ParentDef(null, null), {}, undefined, [], layoutId);
    }

    /**
     * Init
     */
    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build the layout
        this.build(this.layout, new Map(), this.container);
        this._textStyle = translationService.getStyle("chestValueTextStyle") as object;
        this._chestAnim = this.container.children.find((obj) => obj.name === "chest_Anim") as SpineAnimation;
        this._chestAnim.renderable = false;

        this._chestAnimBG = this.container.children.find((obj) => obj.name === "chest_Anim_bg") as SpineAnimation;
        this._chestAnimBG.renderable = false;

        // eslint-disable-next-line prefer-destructuring
        this._chestValueContainer = this._chestAnim.spine.children[19];

        this.setUpSpineAnimationEventListners();
    }

    private setUpSpineAnimationEventListners(): void {
        // Add a listener for starting/completion of the chest anim
        this._chestAnim.spine.state.addListener({
            start: (entry) => {
                if (entry.animation.name === Chest.chestIntroAnimationName) {
                    this.pulseTheWinAmountText();
                }

                if (entry.animation.name === Chest.chestOpeningAnimationName) {
                    //TODO: might need to add in delay to match the frame that chest were opened.
                    soundManager.execute("onBonusIWAmount");
                }

                if (entry.animation.name === Chest.chestOutroAnimationName) {
                    soundManager.execute("onIWWoosh2");
                    this._chestAnimBG.setAnimation(Chest.chestBackgroundOutroAnimationName);
                }
            },
            complete: (entry) => {
                if (entry.animation.name === Chest.chestOutroAnimationName) {
                    if (this._onComplete !== undefined) this._onComplete();
                }

                if (entry.animation.name === Chest.chestOpendedLoopAnimationName) {
                    this.tweenOut();
                }
            },
        });
    }

    /**
     * presentWin
     * @returns Promise<void>
     */
    public async presentWin(winAmount: number, chestSymbolCard): Promise<void> {
        await new Promise<void>((resolve) => {
            this._winAmount = winAmount;
            this.updateWinTextValue();
            // Find out the global position of the target symbol
            let startPoint = new PIXI.Point(0, 0);
            startPoint = chestSymbolCard.toGlobal(startPoint);
            // Now we need to figure out how that translates to a local position within this container
            const local = this.container.toLocal(startPoint);
            // We have our starting position
            this._sourceX = local.x;
            this._sourceY = local.y;
            this.tweenIn();
            this._chestAnim.renderable = true;
            soundManager.execute("onIWWoosh1");
            this._chestAnim.updateTransform();
            this._chestAnim.setAnimation(Chest.chestIntroAnimationName);
            this._chestAnim.addAnimation(Chest.chestOpeningAnimationName);
            this._chestAnim.addAnimation(Chest.chestOpendedLoopAnimationName);
            this._chestAnim.addAnimation(Chest.chestOutroAnimationName);
            this._chestAnim.play();
            this._chestAnimBG.renderable = true;
            this._chestAnimBG.updateTransform();
            this._chestAnimBG.setAnimation(Chest.chestBackgroundIntroAnimationName);
            this._chestAnimBG.play();
            this._onComplete = resolve;
        });

        this._onComplete = undefined;
        this.hide();
    }

    private tweenIn() {
        TweenMax.fromTo(
            this._chestAnim.position,
            0.25,
            { x: this._sourceX, y: this._sourceY },
            { x: this._destinationX, y: this._destinationY },
        ); //, delay: 0.25
    }

    private tweenOut() {
        if (this._pulseTextTimeline) {
            this._pulseTextTimeline.kill();
            this._pulseTextTimeline = undefined;
            TweenMax.to(this._winAmountText.scale, 0.5, { x: 0.5, y: 0.5, delay: 0.25 }); //, delay: 0.25
            TweenMax.to(this._winAmountText, 0.5, { alpha: 0.2, delay: 0.25 }); //, delay: 0.25
        }

        TweenMax.fromTo(
            this._chestAnim.position,
            0.25,
            { x: this._destinationX, y: this._destinationY },
            { x: this._sourceX, y: this._sourceY },
        ); //, delay: 0.25
    }

    private updateWinTextValue() {
        if (this._winAmountText) {
            this._winAmountText.destroy();
            this._winAmountText = undefined;
        }
        this._chestValueContainer.removeChildren();
        this._winAmountText = new TextAutoFit(
            currencyService.format(this._winAmount, iwProps.denomination),
            this._textStyle,
            undefined,
            true,
        );
        this._winAmountText.anchor.set(0.5, 0.5);
        this._winAmountText.position.set(0, -205);
        this._chestValueContainer.addChild(this._winAmountText);
    }

    private hide(): void {
        this._chestAnim.renderable = false;
        this.reset();
    }

    private reset(): void {
        //TODO: might not need this
    }

    private pulseTheWinAmountText() {
        this._pulseTextTimeline = new TimelineMax();
        this._pulseTextTimeline.fromTo(
            this._winAmountText.scale,
            0.5,
            { x: 1, y: 1 },
            { x: 1.2, y: 1.2, yoyo: true, repeat: -1 },
            "0",
        );
    }
}
