import { Bounce, Power1, TweenMax } from "gsap";
import { Container } from "pixi.js";
import { BaseAction, SpineAnimation, StorageService, TextAutoFit } from "playa-core";
import { MarketingScreen, IToggle, IWData, IWProps } from "playa-iw";
import { gameStore } from "../../components";
import { SymbolSelectionReelAnimation } from "./SymbolSelectionReelAnimation";

/**
 * Win Up To component
 */
export class MarketingScreenSettings extends MarketingScreen {
    private static readonly orientationChanged: string = "uiOrientationChanged";

    // Toggle on/off names
    private TOGGLE_SHOW_AGAIN: string = "DoNotShowAgainCheckBoxOn";

    private TOGGLE_DO_NOT_SHOW_AGAIN: string = "DoNotShowAgainCheckBoxOff";

    public static readonly symbolSelectionAnimationReelConfigName = "symbolSelectionAnimationReel.json";

    // Setup data
    private _setupData = {
        TOGGLE_CONTAINER: "tutorialDoNotShowAgainCheckBox",
        CLOSE_BUTTON_NAME: "marketingScreenCloseButton",
    };

    //Used to hold initial Marketing screen's showing game features animation
    private jewelBoxAnim!: SpineAnimation;

    private sevenAnim!: SpineAnimation;

    private _symbolSelectionReelAnimation!: SymbolSelectionReelAnimation;

    private _gameContainer!: Container;

    private _uiContainer!: Container;

    private _winUpToContainer!: Container;

    private _uiFooterContainer!: Container;

    public constructor(
        parentProps: IWProps,
        parentActions: BaseAction<IWData>,
        assetIds: string[],
        layoutId: string,
        storageService: StorageService | null,
    ) {
        super(parentProps, parentActions, assetIds, layoutId, storageService);

        this._symbolSelectionReelAnimation = new SymbolSelectionReelAnimation(
            [MarketingScreenSettings.symbolSelectionAnimationReelConfigName],
            "reel_animation_tutorialContent",
            Bounce.easeOut,
            MarketingScreenSettings.symbolSelectionAnimationReelConfigName,
            true,
        );
    }

    /**
     * init
     */
    protected async init(): Promise<void> {
        // Store variable options
        // Defaults will be used if this is not called
        super.setup(this._setupData);

        // Init
        super.init();
        // const config = this.assets.get(MarketingScreenSettings.SymbolSelectionAnimationReelConfigName);
        const tutorialContent1 = this.container.children.find((obj) => obj.name === "tutorialContent1") as Container;
        const tutorialContent2 = this.container.children.find((obj) => obj.name === "tutorialContent2") as Container;
        // const tutorialContent3 = this.container.children.find((obj) => obj.name === "tutorialContent3") as Container;
        this._gameContainer = this.container.parent.children.find((obj) => obj.name === "gameContainer") as Container;

        this._uiContainer = this.container.parent.children.find((obj) => obj.name === "ui") as Container;

        this._winUpToContainer = this.container.parent.children.find((obj) => obj.name === "winUpTo") as Container;

        this._uiFooterContainer = this.container.parent.children.find((obj) => obj.name === "uiFooterBar") as Container;

        this.jewelBoxAnim = tutorialContent1.children.find(
            (obj) => obj.name === "bonusMarketingScreen_anim_jewelBox",
        ) as SpineAnimation;
        this.sevenAnim = tutorialContent2.children.find(
            (obj) => obj.name === "bonusMarketingScreen_anim_seven",
        ) as SpineAnimation;
        this.jewelBoxAnim.updateTransform();
        this.sevenAnim.updateTransform();
        this.jewelBoxAnim.setAnimation("Jewel box bonus", undefined, true);
        this.sevenAnim.setAnimation("7 bonus", undefined, true);
        this.jewelBoxAnim.play();
        this.sevenAnim.play();

        // Pulse call to action
        this.pulsePrompt(true);

        // Register toggle
        // super.registerToggle(this.findToggle());
    }

    /**
     * Find toggle on/off sprites
     */
    private findToggle(): IToggle {
        return {
            toggleOn: this.toggleSwitch.children.find((obj) => obj.name === this.TOGGLE_DO_NOT_SHOW_AGAIN),
            toggleOff: this.toggleSwitch.children.find((obj) => obj.name === this.TOGGLE_SHOW_AGAIN),
        };
    }

    /**
     * Add listeners to close button and toggle
     * @override the reason to override it so that there is no listners for Do not show gain.
     */
    protected addListeners(): void {
        // Add listener to close button
        this.marketingScreenCloseButton.on("buttonup", () => {
            this.handleMarketingScreenClose();
        });
    }

    public show(isFirstLoad: boolean): void {
        super.show(isFirstLoad);
        if (this.container.visible === true) {
            this._gameContainer.renderable = false;
            this._gameContainer.visible = false;
            this._uiContainer.renderable = false;
            this._winUpToContainer.renderable = false;
            this._uiFooterContainer.renderable = false;
            //We only want to start spin if marketing screen is not being show before then hide, this will prevent double spin of the winning symbol
            this._symbolSelectionReelAnimation.spinWithoutLanding();
        }
    }

    private showGameContainer(): void {
        this._gameContainer.renderable = true;
        this._gameContainer.visible = true;
        this._uiContainer.renderable = true;
        this._winUpToContainer.renderable = true;
        this._uiFooterContainer.renderable = true;
    }

    /**
     * stopSpine
     */
    private stopSpine(): void {
        this.stopSpineAnim(this.jewelBoxAnim);
        this.stopSpineAnim(this.sevenAnim);
    }

    /**
     * stopSpineAnim
     * @param anims
     */
    private stopSpineAnim(anim: SpineAnimation): void {
        anim.setToSetupPose();
        anim.spine.state.tracks = [];
        anim.renderable = false;
    }

    /**
     * Hide function
     * Override the class hide function so we are able to stop the spine anim before proceeding to hide
     */
    public hide(): void {
        this.showGameContainer();
        // Stop pulse
        const gameOptions = this.assets.get(MarketingScreenSettings.configName).GameOptions;
        const fadeOutDuration: number = gameOptions.marketingScreenFadeDuration || 0;
        TweenMax.to(this.container, fadeOutDuration, {
            alpha: 0,
            onComplete: () => {
                // // Stop the spine animation
                this.stopSpine();
                //Stop the spin effect from going on
                this._symbolSelectionReelAnimation.stopSpinForever();
                // Proceed with hide
                super.hide();
                // Reset alpha
                this.container.alpha = 0;
                // Also set the info button as not pressed
                gameStore.actions.revealActions.infoButtonPressed(false);
                // Stop pulse
                this.pulsePrompt(false);
            },
        });
    }

    /**
     * pulsePrompt
     * @param isPulse
     */
    private pulsePrompt(isPulse: boolean): void {
        const tapAnywherePrompt = this.container.children.find(
            (obj) => obj.name === "tapAnywhere_label",
        ) as TextAutoFit;
        // If pulse false, kill all tweens and reset scale
        if (!isPulse) {
            //Reset the pusling of the initial text if we are not pulsing
            TweenMax.killTweensOf(tapAnywherePrompt.scale);
            tapAnywherePrompt.scale.set(1, 1);
            return;
        }
        // Pulse text
        TweenMax.to(tapAnywherePrompt.scale, 0.5, { x: 1.1, y: 1.1, yoyo: true, repeat: -1, ease: Power1.easeOut });
    }
}
