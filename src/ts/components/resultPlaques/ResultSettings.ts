import { TweenMax } from "gsap";
import { Container } from "pixi.js";
import { currencyService, soundManager, SpineAnimation, translationService } from "playa-core";
import { ResultPlaques, IResultSetup, IWProps, iwProps } from "playa-iw";
import { gameStore } from "..";
import { LayoutUtils } from "../utils/LayoutUtils";

/**
 * ResultSettings component
 * This is a plaque with spine controlled texts fully animated plaque, so we need to override almost every base functionalities
 */
export class ResultSettings extends ResultPlaques {
    private static readonly orientationChanged: string = "uiOrientationChanged";

    //Currently only have one level of win particle (firework particles?) be played when win is anounced, if we need different levels of win celebration to be played, we need to set it up differently.
    // Setup data
    private _setupData: IResultSetup = {
        WIN_PLAQUE_NAME: "winPlaque",
        LOSE_PLAQUE_NAME: "losePlaque",
        BUY_WIN_MESSAGE: "winPlaqueBuy222_labelsds", // winPlaqueBuy_label
        TRY_WIN_MESSAGE: "winPlaqueTry_label",
        TOTAL_WIN_VALUE: "winPlaque22_value222", // winPlaque_value
        WIN_STRING: "WIN",
        NONWIN_STRING: "NONWIN",
        BUY_STRING: "BUY",
        TRY_STRING: "TRY",
    };

    private _spineAnimNonWin!: SpineAnimation;

    private _spineAnimWin!: SpineAnimation;

    private static readonly LOSE_PLAQUE_SPINE: string = "losePlaqueAnims";

    private static readonly WIN_PLAQUE_SPINE: string = "winPlaqueAnims";

    private static readonly LOSE_PLAQUE_STATIC_LOOP_SPINE_ANIMATION_NAME = "lose/PlaqueStaticLose";

    private static readonly LOSE_PLAQUE_INTRO_SPINE_ANIMATION_NAME = "lose/PlaquePopUpLose"; //lose/PlaquePopUpLose

    private static readonly LOSE_PLAQUE_OUTRO_SPINE_ANIMATION_NAME = "lose/PlaquePopOutLose"; //lose/PlaquePopOutLose

    private static readonly WIN_PLAQUE_STATIC_LOOP_SPINE_ANIMATION_NAME = "Plaque Static/Win Plaque Static";

    private static readonly WIN_PLAQUE_INTRO_SPINE_ANIMATION_NAME = "Plaque Pop Up/Win Plaque Pop Up";

    private static readonly WIN_PLAQUE_OUTRO_SPINE_ANIMATION_NAME = "Plaque Pop Out/Win Plaque Pop Out";

    private _outroAnimName!: string;

    private _targetPrizeValue: number = 0;

    private _targetPlayResult: string = "";

    private _winValuetextStyle;

    private _winLabelStyle;

    private _isWin!: boolean;

    private _isTryMode: boolean = false;

    private _isWinPlaqueIntroCompleted: boolean = false;

    private _winThresholdsForBaseGame;

    public constructor(parentProps: IWProps, assetIds: string[], layoutId: string) {
        super(parentProps, assetIds, layoutId);

        this._outroAnimName = "";
        this._isWinPlaqueIntroCompleted = false;
    }

    /**
     * init
     */
    protected async init(): Promise<void> {
        // Setup
        super.setup(this._setupData);

        // Proceed with init
        super.init();
        this._winValuetextStyle = translationService.getStyle("winValueTextStyle") as object;
        this._winLabelStyle = translationService.getStyle("winLabelTextStyle") as object;
        this.initSpine();

        this._winThresholdsForBaseGame = this.assets.get(ResultSettings.configName).WinThresholdsForBaseGame;
        this._isWin = false;
    }

    private initSpine(): void {
        // Find the losing plaque spine
        const loseContent: any = this.container.children.find(
            (obj: any) => obj.name === this._setupData.LOSE_PLAQUE_NAME,
        ) as Container;
        const winContent: any = this.container.children.find(
            (obj: any) => obj.name === this._setupData.WIN_PLAQUE_NAME,
        ) as Container;
        // this.turnOffButtonsTextures(winContent, loseContent);
        // Grab the SpineAnimations
        this._spineAnimNonWin = loseContent.children.find((obj: any) =>
            obj.name.startsWith(ResultSettings.LOSE_PLAQUE_SPINE),
        ) as SpineAnimation;

        this._spineAnimWin = winContent.children.find((obj: any) =>
            obj.name.startsWith(ResultSettings.WIN_PLAQUE_SPINE),
        ) as SpineAnimation;

        // Add listeners to the intro anims
        this._spineAnimNonWin.spine.state.addListener({
            complete: (entry) => {
                if (entry.animation.name === ResultSettings.LOSE_PLAQUE_INTRO_SPINE_ANIMATION_NAME) {
                    this.losePlaqueIntroComplete();
                }
                if (entry.animation.name === ResultSettings.LOSE_PLAQUE_OUTRO_SPINE_ANIMATION_NAME) {
                    this.stopSpineAnim(this._spineAnimNonWin);
                    super.hide();
                }
            },
        });

        this._spineAnimWin.spine.state.addListener({
            start: (entry) => {
                if (entry.animation.name === ResultSettings.WIN_PLAQUE_INTRO_SPINE_ANIMATION_NAME) {
                    TweenMax.delayedCall(
                        entry.animation.duration * this.gameConfig.rollUpStartTimeInPercantageFromIntroAnimation,
                        () => {
                            this._isWinPlaqueIntroCompleted = true;
                            this.rollUpWinValue(this.currentPrizeValue);
                        },
                    );
                }
            },
            complete: (entry) => {
                if (entry.animation.name === ResultSettings.WIN_PLAQUE_INTRO_SPINE_ANIMATION_NAME) {
                    this.winPlaqueIntroComplete();
                }

                if (entry.animation.name === ResultSettings.WIN_PLAQUE_OUTRO_SPINE_ANIMATION_NAME) {
                    this.stopSpineAnim(this._spineAnimWin);
                    super.hide();
                }
            },
        });
    }

    private losePlaqueIntroComplete(): void {
        this._spineAnimNonWin.updateTransform();
        this._spineAnimNonWin.setAnimation(
            ResultSettings.LOSE_PLAQUE_STATIC_LOOP_SPINE_ANIMATION_NAME,
            undefined,
            true,
        );
        this._spineAnimNonWin.play();
    }

    private winPlaqueIntroComplete(): void {
        this._spineAnimWin.updateTransform();
        this._spineAnimWin.setAnimation(ResultSettings.WIN_PLAQUE_STATIC_LOOP_SPINE_ANIMATION_NAME, undefined, true);
        this._spineAnimWin.play();
    }

    /**
     * Public facing populate
     */
    public populate(data: { playResult: string; prizeValue: number; wagerType: string }): void {
        this._isWinPlaqueIntroCompleted = false;
        // Store target play result and prize value locally
        this._targetPlayResult = data.playResult;
        this._targetPrizeValue = data.prizeValue;
        // Continue with populate
        //Completely override what is in base class, due to we handle the swap out of try button in code
        // Show the relevant plaque
        this._winPlaque.visible = data.playResult === this.WIN && this.gameConfig.showResultScreenWin;
        this._losePlaque.visible = data.playResult === this.NONWIN && this.gameConfig.showResultScreenNonWin;
        // Populate the prize value field
        this.currentPrizeValue = data.playResult === this.WIN ? data.prizeValue : 0;

        //if there is a win, Sets the win plaque initial value if player has won morethan his wager amount
        if (data.playResult === this.WIN) {
            if (this.isPlayerWinBiggerThanHisWager(this.currentPrizeValue) === true) {
                this.changeWinPlaqueWinningAmountText(0);
            } else {
                this.changeWinPlaqueWinningAmountText(this.currentPrizeValue);
            }
        }

        this._isTryMode = data.wagerType === this.TRY;
    }

    /*
     * setRenderable
     */
    private setRenderable(anim: SpineAnimation, renderable: boolean): void {
        anim.renderable = renderable;
    }

    /**
     * Set Spine Rederable and find animation/threshold
     */
    private setSpine(playResult: string, prizeValue: number): void {
        // So, we need to set the spine anim based on the playResult and prizeValue
        // Show the correct spineAnim
        this.setRenderable(this._spineAnimWin, playResult === this._setupData.WIN_STRING);
        this.setRenderable(this._spineAnimNonWin, playResult === this._setupData.NONWIN_STRING);
        // Now set the animation based on the playResult
        if (playResult === this._setupData.NONWIN_STRING) {
            this._isWin = false;

            this.changeNoWinPlaqueLabel();
            // Queue the intro
            this._spineAnimNonWin.updateTransform();
            this._spineAnimNonWin.setAnimation(ResultSettings.LOSE_PLAQUE_INTRO_SPINE_ANIMATION_NAME);
            this._spineAnimNonWin.play();
            this._outroAnimName = ResultSettings.LOSE_PLAQUE_OUTRO_SPINE_ANIMATION_NAME;
            //DO not need to Set the lose Text as it is baked into the spine animation
        } else {
            //Update win value of the win plaque
            this.changeWinPlaqueWithWinPrizeValueAndLabel(prizeValue);
            this._isWin = true;
            // Queue the intro
            this._spineAnimWin.updateTransform();
            this._spineAnimWin.setAnimation(ResultSettings.WIN_PLAQUE_INTRO_SPINE_ANIMATION_NAME);
            this._spineAnimWin.play();
            this._outroAnimName = ResultSettings.WIN_PLAQUE_OUTRO_SPINE_ANIMATION_NAME;
            //TODO: Set the Win Amount as Win Amount is a placeholder texture that is baked into the spine animation
        }
    }

    private isPlayerWinBiggerThanHisWager(targetValue: number): boolean {
        return targetValue > gameStore.props.wager;
    }

    /**
     * rollUpWinValue
     * @override completely override base class version bebcause this is a fully animated spine plaque
     */
    protected rollUpWinValue(targetValue: number): void {
        //we do not want to do the roll up if plaque intro animation has not yet finished playing, we will manually invoke this method by hand
        if (this._isWinPlaqueIntroCompleted === false) return;
        // If rollupWinValueDuration is zero, just populate the win value
        if (this.gameConfig.rollupWinValueDuration === 0 || this.isPlayerWinBiggerThanHisWager(targetValue) === false) {
            if (targetValue > 0) {
                soundManager.execute("RollupWinAllStop");
            }
            return;
        }

        this.playWinCoinShower();

        // If we have a rollup duration greater than zero, use a tween
        if (targetValue > 0) {
            soundManager.execute("RollupWinAllStart");
        }
        this.rollUpTween = TweenMax.to({ current: 0 }, this.gameConfig.rollupWinValueDuration, {
            current: targetValue,
            onUpdate: () => {
                this.changeWinPlaqueWinningAmountText(this.rollUpTween.target.current);
            },
            onComplete: () => {
                if (targetValue > 0) {
                    soundManager.execute("RollupWinAllStop");
                }
            },
        });
    }

    private playWinCoinShower(): void {
        const winRatio = iwProps.totalWin / iwProps.wager;

        //Level 3 coin shower check
        if (this._winThresholdsForBaseGame.level3.lower.inclusive) {
            if (winRatio >= this._winThresholdsForBaseGame.level3.lower.multiplier) {
                soundManager.execute("CoinShower");
                gameStore.actions.revealActions.setWinLevel(3);
            }
        } else if (winRatio > this._winThresholdsForBaseGame.level3.lower.multiplier) {
            soundManager.execute("CoinShower");
            gameStore.actions.revealActions.setWinLevel(3);
        }

        //Level 2 coin shower check
        if (this._winThresholdsForBaseGame.level2.lower.inclusive) {
            if (this._winThresholdsForBaseGame.level2.upper.inclusive) {
                if (
                    this._winThresholdsForBaseGame.level2.upper.multiplier >= winRatio &&
                    this._winThresholdsForBaseGame.level2.lower.multiplier <= winRatio
                ) {
                    soundManager.execute("CoinShower");
                    gameStore.actions.revealActions.setWinLevel(2);
                }
            } else if (
                this._winThresholdsForBaseGame.level2.upper.multiplier > winRatio &&
                this._winThresholdsForBaseGame.level2.lower.multiplier <= winRatio
            ) {
                soundManager.execute("CoinShower");
                gameStore.actions.revealActions.setWinLevel(2);
            }
        } else if (this._winThresholdsForBaseGame.level2.upper.inclusive) {
            if (
                this._winThresholdsForBaseGame.level2.upper.multiplier >= winRatio &&
                this._winThresholdsForBaseGame.level2.lower.multiplier < winRatio
            ) {
                soundManager.execute("CoinShower");
                gameStore.actions.revealActions.setWinLevel(2);
            }
        } else if (
            this._winThresholdsForBaseGame.level2.upper.multiplier > winRatio &&
            this._winThresholdsForBaseGame.level2.lower.multiplier < winRatio
        ) {
            soundManager.execute("CoinShower");
            gameStore.actions.revealActions.setWinLevel(2);
        }

        //Level 1 coin shower check (no coin shower for level 1 for this game)
        if (this._winThresholdsForBaseGame.level1.upper.inclusive) {
            if (this._winThresholdsForBaseGame.level1.upper.multiplier >= winRatio) {
                gameStore.actions.revealActions.setWinLevel(1);
            }
        } else if (this._winThresholdsForBaseGame.level1.upper.multiplier > winRatio) {
            gameStore.actions.revealActions.setWinLevel(1);
        }
    }

    private changeWinPlaqueWinningAmountText(targetValue: number) {
        LayoutUtils.getInstance().changeSpineTextToDifferentTextTexture(
            this._spineAnimWin,
            "win value",
            "trans/win value",
            currencyService.format(targetValue, iwProps.denomination),
            500,
            this._winValuetextStyle,
            250,
        );
    }

    private changeNoWinPlaqueLabel() {
        LayoutUtils.getInstance().changeSpineTextToDifferentTextTexture(
            this._spineAnimNonWin,
            "no win text",
            "trans/no win text",
            translationService.getString("messages.losePlaque_label") as string,
            650,
            this._winLabelStyle,
            350,
        );
    }

    private changeWinPlaqueWithWinPrizeValueAndLabel(prizeValue: number) {
        if (this._isTryMode) {
            LayoutUtils.getInstance().changeSpineTextToDifferentTextTexture(
                this._spineAnimWin,
                "win text",
                "trans/win text",
                translationService.getString("messages.winPlaqueTry_label") as string,
                650,
                this._winLabelStyle,
                325,
            );
        } else {
            LayoutUtils.getInstance().changeSpineTextToDifferentTextTexture(
                this._spineAnimWin,
                "win text",
                "trans/win text",
                translationService.getString("messages.winPlaqueBuy_label") as string,
                650,
                this._winLabelStyle,
                325,
            );
        }
    }

    /**
     * showComplete
     * Plaque is fully rendered
     * override showComplete method from AnimatedPlaque, since this class inherites from ResultPlaques and then ResultPlaques inherites from AnimatedPlaque
     */
    public showComplete(): void {
        super.showComplete();
        // Start the spine animation
        // Set to the correct animation
        this.setSpine(this._targetPlayResult, this._targetPrizeValue);
    }

    /**
     * hide
     * override parent class's hide method
     */
    public hide(): void {
        gameStore.actions.revealActions.setWinLevel(0);
        if (this._outroAnimName !== "") {
            if (this._isWin) {
                this.stopSpineAnim(this._spineAnimNonWin);
                this._spineAnimWin.setAnimation(this._outroAnimName, undefined, false);
                this._spineAnimWin.play();
            } else {
                // this.transitionScaleOutInElement(this.noWinText, false);
                this.stopSpineAnim(this._spineAnimWin);
                this._spineAnimNonWin.setAnimation(this._outroAnimName, undefined, false);
                this._spineAnimNonWin.play();
            }
        } else {
            super.hide();
            this.stopSpineAnim(this._spineAnimWin);
            this.stopSpineAnim(this._spineAnimNonWin);
        }

        //TODO: might need to play the outro animation, then calls hide on onComplete callback of outro animation
        // this.stopSpineAnim(this._spineAnimWin);
        // this.stopSpineAnim(this._spineAnimNonWin);
        this._isWin = false;
        this._outroAnimName = "";
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
}
