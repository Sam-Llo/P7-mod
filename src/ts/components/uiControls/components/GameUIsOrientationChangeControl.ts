import { Container, Sprite } from "pixi.js";
import {
    loaderService,
    MobxUtils,
    Orientation,
    SpineAnimation,
    systemProps,
    TextAutoFit,
    translationService,
} from "playa-core";

/**
 * GameUIsOrientationChangeControl
 * since this game's landscape buttons and portrait orientation buttons got different shape of textures, we need to swap texture in run time based on orientation
 */
export class GameUIsOrientationChangeControl {
    private static readonly buttonTextureOrientationChangedReaction: string = "buttonTextureOrientationChangedReaction";

    private static readonly rectangleUIBgEnabledTexture = "revealAllStartButton_enabledBg";

    private static readonly rectangleUIBgOverTexture = "buy_button_over_lds";

    private static readonly rectangleUIBgPressedTexture = "buy_button_pressed_lds";

    private static readonly rectangleUIBgDisabledTexture = "buy_button_disabled_lds";

    private static readonly circleUIBgEnabledTexture = "revealAllStopButton_enabledBg_img2";

    private static readonly circleUIBgOverTexture = "revealAllStopButton_overBg_img2";

    private static readonly circleUIBgPressedTexture = "revealAllStopButton_pressedBg_img2";

    private static readonly circleUIBgDisabledTexture = "revealAllStopButton_disabledBg_img2";

    private BUY_HIGHLIGHT_ANIM: string = "buyButtonHighlight_anim";

    private BUY_HIGHLIGHT_ANIM_PRT: string = "buyButtonHighlight_anim_prt";

    private _buySpineAnim!: SpineAnimation;

    private _buySpineAnimPortrait!: SpineAnimation;

    private _buyButtonEnabledBg;

    private _buyButtonOverBg;

    private _buyButtonPressedBg;

    private _buyButtonDisabledBg;

    private _stopAutoPlayButtonEnabledBg;

    private _stopAutoPlayButtonOverBg;

    private _stopAutoPlayButtonPressedBg;

    private _stopAutoPlayButtonDisabledBg;

    private _exitButtonEnabledBg;

    private _exitButtonOverBg;

    private _exitButtonPressedBg;

    private _exitButtonDisabledBg;

    private _playButtonEnabledBg;

    private _playButtonOverBg;

    private _playButtonPressedBg;

    private _playButtonDisabledBg;

    private _moveToMoneyPromptButtonEnabledBg;

    private _moveToMoneyPromptButtonOverBg;

    private _moveToMoneyPromptButtonPressedBg;

    private _moveToMoneyPromptButtonDisabledBg;

    private _retryButtonEnabledBg;

    private _retryButtonOverBg;

    private _retryButtonPressedBg;

    private _retryButtonDisabledBg;

    private _revealAllStartButtonEnabledBg;

    private _revealAllStartButtonOverBg;

    private _revealAllStartButtonPressedBg;

    private _revealAllStartButtonDisabledBg;

    private _revealAllStopButtonEnabledBg;

    private _revealAllStopButtonOverBg;

    private _revealAllStopButtonPressedBg;

    private _revealAllStopButtonDisabledBg;

    private _revealAllStartButtonEnabledLabel;

    private _revealAllStartButtonOverLabel;

    private _revealAllStartButtonPressedLabel;

    private _revealAllStartButtonDisabledLabel;

    private _shouldBuyButtonHighlightVisible: boolean;

    constructor(
        buyBtn,
        stopAutoPlayBtn,
        exitBtn,
        playBtn,
        moveToMoneyPromptBtn,
        retryBtn,
        revealAllStartBtn,
        revealAllStopBtn,
    ) {
        this._shouldBuyButtonHighlightVisible = true;
        this.initBuyButtonElements(buyBtn);
        this.initStopAutoPlayButtonElements(stopAutoPlayBtn);
        this.initExitButtonElements(exitBtn);
        this.initPlayButtonElements(playBtn);
        this.initMoveToMoneyPromptButtonElements(moveToMoneyPromptBtn);
        this.initRetryButtonElements(retryBtn);
        this.initRevealStartButtonElements(revealAllStartBtn);
        this.initRevealStopButtonElements(revealAllStopBtn);

        this.orientationChangedForUITexturesSwap();
    }

    private stopSpineAnim(anim: SpineAnimation): void {
        anim.setToSetupPose();
        anim.spine.state.tracks = [];
        anim.renderable = false;
    }

    public setBuyButtonHighlight(highlight: boolean) {
        this._shouldBuyButtonHighlightVisible = highlight;
        if (this._shouldBuyButtonHighlightVisible === false) {
            this.stopSpineAnim(this._buySpineAnim);
            this.stopSpineAnim(this._buySpineAnimPortrait);
            this._buyButtonDisabledBg.visible = true;
        } else {
            this._buyButtonDisabledBg.visible = false;
            this._buySpineAnim.updateTransform();
            this._buySpineAnimPortrait.updateTransform();
            this._buySpineAnim.setAnimation("BuyButtonLandscape", undefined, true);
            this._buySpineAnimPortrait.setAnimation("BuyButtonPortrait", undefined, true);
            this._buySpineAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
            this._buySpineAnimPortrait.renderable = !this._buySpineAnim.renderable;
            this._buySpineAnim.play();
            this._buySpineAnimPortrait.play();
        }
    }

    private initBuyButtonElements(buyBtn): void {
        const buyButtonEnabled = buyBtn.children.find((obj: any) =>
            obj.name.startsWith("buyButton_enabled"),
        ) as Container;

        buyBtn.children.forEach((obj: any) => {
            if (obj.name && obj.name === this.BUY_HIGHLIGHT_ANIM) {
                this._buySpineAnim = obj;
            }
        });

        // Find the portrait one
        buyBtn.children.forEach((obj: any) => {
            if (obj.name && obj.name === this.BUY_HIGHLIGHT_ANIM_PRT) {
                this._buySpineAnimPortrait = obj;
            }
        });

        buyBtn.on("pointerover", () => {
            if (this._shouldBuyButtonHighlightVisible === false) return;

            const landscapeTime = this._buySpineAnim.spine.state.getCurrent(0).trackTime;
            const portraiTime = this._buySpineAnimPortrait.spine.state.getCurrent(0).trackTime;
            this._buySpineAnim.setAnimation("BuyButtonLandscapeMouseover", undefined, true).trackTime = landscapeTime;
            this._buySpineAnimPortrait.setAnimation(
                "BuyButtonPortraitMouseOver",
                undefined,
                true,
            ).trackTime = portraiTime;
        });
        buyBtn.on("pointerout", () => {
            if (this._shouldBuyButtonHighlightVisible === false) return;

            const landscapeTime = this._buySpineAnim.spine.state.getCurrent(0).trackTime;
            const portraiTime = this._buySpineAnimPortrait.spine.state.getCurrent(0).trackTime;
            this._buySpineAnim.setAnimation("BuyButtonLandscape", undefined, true).trackTime = landscapeTime;
            this._buySpineAnimPortrait.setAnimation("BuyButtonPortrait", undefined, true).trackTime = portraiTime;
        });

        const buyButtonOver = buyBtn.children.find((obj: any) => obj.name.startsWith("buyButton_over")) as Container;
        const buyButtonPressed = buyBtn.children.find((obj: any) =>
            obj.name.startsWith("buyButton_pressed"),
        ) as Container;
        const buyButtonDisabled = buyBtn.children.find((obj: any) =>
            obj.name.startsWith("buyButton_disabled"),
        ) as Container;

        this._buyButtonEnabledBg = buyButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("buyButton_enabledBg"),
        ) as Sprite;

        this._buyButtonOverBg = buyButtonOver.children.find((obj: any) =>
            obj.name.startsWith("buyButton_overBg"),
        ) as Sprite;

        this._buyButtonPressedBg = buyButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("buyButton_pressedBg"),
        ) as Sprite;

        this._buyButtonDisabledBg = buyButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("buyButton_disabledBg"),
        ) as Sprite;

        this.setBuyButtonHighlight(this._shouldBuyButtonHighlightVisible);
    }

    private initStopAutoPlayButtonElements(stopAutoPlayBtn): void {
        const stopAutoPlayButtonEnabled = stopAutoPlayBtn.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_enabled"),
        ) as Container;
        const stopAutoPlayButtonOver = stopAutoPlayBtn.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_over"),
        ) as Container;
        const stopAutoPlayButtonPressed = stopAutoPlayBtn.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_pressed"),
        ) as Container;
        const stopAutoPlayButtonDisabled = stopAutoPlayBtn.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_disabled"),
        ) as Container;

        this._stopAutoPlayButtonEnabledBg = stopAutoPlayButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_enabledBg"),
        ) as Sprite;

        this._stopAutoPlayButtonOverBg = stopAutoPlayButtonOver.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_overBg"),
        ) as Sprite;

        this._stopAutoPlayButtonPressedBg = stopAutoPlayButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_pressedBg"),
        ) as Sprite;

        this._stopAutoPlayButtonDisabledBg = stopAutoPlayButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("stopAutoPlayButton_disabledBg"),
        ) as Sprite;
    }

    private initExitButtonElements(exitBtn): void {
        const exitButtonEnabled = exitBtn.children.find((obj: any) =>
            obj.name.startsWith("exitButton_enabled"),
        ) as Container;
        const exitButtonOver = exitBtn.children.find((obj: any) => obj.name.startsWith("exitButton_over")) as Container;
        const exitButtonPressed = exitBtn.children.find((obj: any) =>
            obj.name.startsWith("exitButton_pressed"),
        ) as Container;
        const exitButtonDisabled = exitBtn.children.find((obj: any) =>
            obj.name.startsWith("exitButton_disabled"),
        ) as Container;

        this._exitButtonEnabledBg = exitButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("exitButton_enabledBg"),
        ) as Sprite;

        this._exitButtonOverBg = exitButtonOver.children.find((obj: any) =>
            obj.name.startsWith("exitButton_overBg"),
        ) as Sprite;

        this._exitButtonPressedBg = exitButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("exitButton_pressedBg"),
        ) as Sprite;

        this._exitButtonDisabledBg = exitButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("exitButton_disabledBg"),
        ) as Sprite;
    }

    private initPlayButtonElements(playBtn): void {
        const playButtonEnabled = playBtn.children.find((obj: any) =>
            obj.name.startsWith("playButton_enabled"),
        ) as Container;
        const playButtonOver = playBtn.children.find((obj: any) => obj.name.startsWith("playButton_over")) as Container;
        const playButtonPressed = playBtn.children.find((obj: any) =>
            obj.name.startsWith("playButton_pressed"),
        ) as Container;
        const playButtonDisabled = playBtn.children.find((obj: any) =>
            obj.name.startsWith("playButton_disabled"),
        ) as Container;

        this._playButtonEnabledBg = playButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("playButton_enabledBg"),
        ) as Sprite;

        this._playButtonOverBg = playButtonOver.children.find((obj: any) =>
            obj.name.startsWith("playButton_overBg"),
        ) as Sprite;

        this._playButtonPressedBg = playButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("playButton_pressedBg"),
        ) as Sprite;

        this._playButtonDisabledBg = playButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("playButton_disabledBg"),
        ) as Sprite;
    }

    private initMoveToMoneyPromptButtonElements(moveToMoneyPromptBtn): void {
        const moveToMoneyPromptButtonEnabled = moveToMoneyPromptBtn.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_enabled"),
        ) as Container;
        const moveToMoneyPromptButtonOver = moveToMoneyPromptBtn.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_over"),
        ) as Container;
        const moveToMoneyPromptButtonPressed = moveToMoneyPromptBtn.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_pressed"),
        ) as Container;
        const moveToMoneyPromptButtonDisabled = moveToMoneyPromptBtn.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_disabled"),
        ) as Container;

        this._moveToMoneyPromptButtonEnabledBg = moveToMoneyPromptButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_enabledBg"),
        ) as Sprite;

        this._moveToMoneyPromptButtonOverBg = moveToMoneyPromptButtonOver.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_overBg"),
        ) as Sprite;

        this._moveToMoneyPromptButtonPressedBg = moveToMoneyPromptButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_pressedBg"),
        ) as Sprite;

        this._moveToMoneyPromptButtonDisabledBg = moveToMoneyPromptButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("moveToMoneyPromptButton_disabledBg"),
        ) as Sprite;
    }

    private initRetryButtonElements(retryBtn): void {
        const retryButtonEnabled = retryBtn.children.find((obj: any) =>
            obj.name.startsWith("retryButton_enabled"),
        ) as Container;
        const retryButtonOver = retryBtn.children.find((obj: any) =>
            obj.name.startsWith("retryButton_over"),
        ) as Container;
        const retryButtonPressed = retryBtn.children.find((obj: any) =>
            obj.name.startsWith("retryButton_pressed"),
        ) as Container;
        const retryButtonDisabled = retryBtn.children.find((obj: any) =>
            obj.name.startsWith("retryButton_disabled"),
        ) as Container;

        this._retryButtonEnabledBg = retryButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("retryButton_enabledBg"),
        ) as Sprite;

        this._retryButtonOverBg = retryButtonOver.children.find((obj: any) =>
            obj.name.startsWith("retryButton_overBg"),
        ) as Sprite;

        this._retryButtonPressedBg = retryButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("retryButton_pressedBg"),
        ) as Sprite;

        this._retryButtonDisabledBg = retryButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("retryButton_disabledBg"),
        ) as Sprite;
    }

    private initRevealStartButtonElements(revealAllStartBtn) {
        //REVEAL ALL START button
        const revealAllStartButtonEnabled = revealAllStartBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_enabled"),
        ) as Container;
        const revealAllStartButtonOver = revealAllStartBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_over"),
        ) as Container;
        const revealAllStartButtonPressed = revealAllStartBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_pressed"),
        ) as Container;
        const revealAllStartButtonDisabled = revealAllStartBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_disabled"),
        ) as Container;

        this._revealAllStartButtonEnabledBg = revealAllStartButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_enabledBg"),
        ) as Sprite;

        this._revealAllStartButtonOverBg = revealAllStartButtonOver.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_overBg"),
        ) as Sprite;

        this._revealAllStartButtonPressedBg = revealAllStartButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_pressedBg"),
        ) as Sprite;

        this._revealAllStartButtonDisabledBg = revealAllStartButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_disabledBg"),
        ) as Sprite;

        this._revealAllStartButtonEnabledLabel = revealAllStartButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_enabled_label"),
        ) as Sprite;

        this._revealAllStartButtonOverLabel = revealAllStartButtonOver.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_over_label"),
        ) as Sprite;

        this._revealAllStartButtonPressedLabel = revealAllStartButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_pressed_label"),
        ) as Sprite;

        this._revealAllStartButtonDisabledLabel = revealAllStartButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("revealAllStartButton_disabled_label"),
        ) as Sprite;
    }

    private initRevealStopButtonElements(revealAllStopBtn) {
        //REVEAL ALL STOP button
        const revealAllStopButtonEnabled = revealAllStopBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_enabled"),
        ) as Container;
        const revealAllStopButtonOver = revealAllStopBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_over"),
        ) as Container;
        const revealAllStopButtonPressed = revealAllStopBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_pressed"),
        ) as Container;
        const revealAllStopButtonDisabled = revealAllStopBtn.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_disabled"),
        ) as Container;

        this._revealAllStopButtonEnabledBg = revealAllStopButtonEnabled.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_enabledBg"),
        ) as Sprite;

        this._revealAllStopButtonOverBg = revealAllStopButtonOver.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_overBg"),
        ) as Sprite;

        this._revealAllStopButtonPressedBg = revealAllStopButtonPressed.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_pressedBg"),
        ) as Sprite;

        this._revealAllStopButtonDisabledBg = revealAllStopButtonDisabled.children.find((obj: any) =>
            obj.name.startsWith("revealAllStopButton_disabledBg"),
        ) as Sprite;
    }

    private orientationChangedForUITexturesSwap() {
        MobxUtils.getInstance().addReaction(
            GameUIsOrientationChangeControl.buttonTextureOrientationChangedReaction,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                this.setBuyButtonHighlight(this._shouldBuyButtonHighlightVisible);

                this.changeBuyButtonTextureBasedOnOrientation(orientation);
                this.changeStopAutoPlayButtonTextureBasedOnOrientation(orientation);
                this.changeExitButtonTextureBasedOnOrientation(orientation);
                this.changePlayButtonTextureBasedOnOrientation(orientation);
                this.changeMoveToMoneyPromptButtonTextureBasedOnOrientation(orientation);
                this.changeRetryButtonTextureBasedOnOrientation(orientation);
                this.changeRevealAllStartButtonTextureBasedOnOrientation(orientation);
                this.changeRevealAllStopButtonTextureBasedOnOrientation(orientation);
            },
            { fireImmediately: true },
        );
    }

    private changeBuyButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            this._buyButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._buyButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._buyButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._buyButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            this._buyButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._buyButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._buyButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._buyButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }

    private changeStopAutoPlayButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            this._stopAutoPlayButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._stopAutoPlayButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._stopAutoPlayButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._stopAutoPlayButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            this._stopAutoPlayButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._stopAutoPlayButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._stopAutoPlayButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._stopAutoPlayButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }

    private changeExitButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            this._exitButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._exitButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._exitButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._exitButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            this._exitButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._exitButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._exitButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._exitButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }

    private changePlayButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            this._playButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._playButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._playButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._playButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            this._playButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._playButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._playButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._playButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }

    private changeMoveToMoneyPromptButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            this._moveToMoneyPromptButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._moveToMoneyPromptButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._moveToMoneyPromptButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._moveToMoneyPromptButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            this._moveToMoneyPromptButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._moveToMoneyPromptButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._moveToMoneyPromptButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._moveToMoneyPromptButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }

    private changeRetryButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            this._retryButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._retryButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._retryButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._retryButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            this._retryButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._retryButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._retryButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._retryButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }

    private changeRevealAllStartButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            //REVEAL ALL START button
            this._revealAllStartButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._revealAllStartButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._revealAllStartButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._revealAllStartButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );

            //text change
            this._revealAllStartButtonEnabledLabel.text = translationService.getString(
                "messages.revealAllStartButton_enabled_label",
            );
            this._revealAllStartButtonOverLabel.text = translationService.getString(
                "messages.revealAllStartButton_over_label",
            );
            this._revealAllStartButtonPressedLabel.text = translationService.getString(
                "messages.revealAllStartButton_pressed_label",
            );
            this._revealAllStartButtonDisabledLabel.text = translationService.getString(
                "messages.revealAllStartButton_disabled_label",
            );
        } else {
            //REVEAL ALL START button
            this._revealAllStartButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._revealAllStartButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._revealAllStartButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._revealAllStartButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
            //text change
            this._revealAllStartButtonEnabledLabel.text = translationService.getString(
                "messages.revealAllStartButton_enabled_label_portrait",
            );
            this._revealAllStartButtonOverLabel.text = translationService.getString(
                "messages.revealAllStartButton_over_label_portrait",
            );
            this._revealAllStartButtonPressedLabel.text = translationService.getString(
                "messages.revealAllStartButton_pressed_label_portrait",
            );
            this._revealAllStartButtonDisabledLabel.text = translationService.getString(
                "messages.revealAllStartButton_disabled_label_portrait",
            );
        }
    }

    private changeRevealAllStopButtonTextureBasedOnOrientation(orientation: Orientation) {
        if (orientation === Orientation.LANDSCAPE) {
            //REVEAL ALL STOP button
            this._revealAllStopButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgEnabledTexture,
            );
            this._revealAllStopButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgOverTexture,
            );
            this._revealAllStopButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgPressedTexture,
            );
            this._revealAllStopButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.rectangleUIBgDisabledTexture,
            );
        } else {
            //REVEAL ALL STOP button
            this._revealAllStopButtonEnabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgEnabledTexture,
            );
            this._revealAllStopButtonOverBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgOverTexture,
            );
            this._revealAllStopButtonPressedBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgPressedTexture,
            );
            this._revealAllStopButtonDisabledBg.texture = loaderService.fromCache(
                GameUIsOrientationChangeControl.circleUIBgDisabledTexture,
            );
        }
    }
}
