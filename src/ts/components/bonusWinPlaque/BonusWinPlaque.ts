import { throws } from "assert";
import { TweenMax } from "gsap";
import { currencyService, ParentDef, soundManager, SpineAnimation, TextAutoFit, translationService } from "playa-core";
import { AnimatedPlaque, iwProps, IWProps } from "playa-iw";
import { gameStore } from "..";
import { LayoutUtils } from "../utils/LayoutUtils";

/**
 * BonusWinPlaque
 * Used to show the win amount for lock and reel bonus game
 */
export class BonusWinPlaque extends AnimatedPlaque<IWProps, null> {
    //Grab the config
    public static readonly configName: string = "gameConfig.json";

    private static readonly introAnimationName = "win/white/PlaquePopUpWhite";

    private static readonly outroAnimationName = "win/white/PlaquePopOutWhite";

    private static readonly staticLoopAnimationName = "win/white/PlaqueStaticWhite";

    private static readonly spineAnimName: string = "bonusWinPlaqueAnim";

    private _spineAnim!: SpineAnimation;

    private _winTextFields: TextAutoFit[] = [];

    private _presentComplete;

    private _winAmount!: number;

    private _winValuetextStyle;

    private _winLabelStyle;

    private _bonusWinPresentationTime: number = 2.5;

    private _winThresholdsForBonusGame;

    public constructor(parentProps: IWProps, assetsIds: string[], layoutId: string) {
        // This is a constructor from a derived class
        // As we're using an animated plaque, we can pass through the tween properties
        super(new ParentDef(parentProps, null), undefined, assetsIds, layoutId);
    }

    /**
     * init
     * @returns Promise<void>
     */
    protected async init(): Promise<void> {
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }
        // Build the layout
        this.build(this.layout, new Map(), this.container);
        this._winValuetextStyle = translationService.getStyle("winValueTextStyle") as object;
        this._winLabelStyle = translationService.getStyle("winLabelTextStyle") as object;

        //const buyMsg: any = this.container.children.find((obj: any) => obj.name === this._setupData.BUY_WIN_MESSAGE);
        //const tryMsg: any = this.container.children.find((obj: any) => obj.name === this._setupData.TRY_WIN_MESSAGE);
        const winVal: any = this.container.children.find((obj: any) => obj.name === "bonuswinPlaque_value");
        const winLbl: any = this.container.children.find((obj: any) => obj.name === "bonuswinPlaque_label");
        this._winTextFields.push(winVal, winLbl);

        this._winTextFields.forEach((obj: TextAutoFit) => {
            obj.alpha = 0;
        });
        // Init spine
        this._spineAnim = this.container.children.find(
            (obj) => obj.name === BonusWinPlaque.spineAnimName,
        ) as SpineAnimation;
        this._spineAnim.renderable = false;
        // Add a listener to the spine anim
        this._spineAnim.spine.state.addListener({
            start: (entry) => {
                if (entry.animation.name === BonusWinPlaque.outroAnimationName) {
                    gameStore.actions.revealActions.setWinLevel(0);
                }
            },
            complete: (entry) => {
                if (entry.animation.name === BonusWinPlaque.introAnimationName) {
                    gameStore.actions.revealActions.addWin(this._winAmount);
                    let dur: number = 0;
                    this._spineAnim.spine.state.data.skeletonData.animations.forEach((anim: any) => {
                        dur = anim.name === BonusWinPlaque.introAnimationName ? (anim.duration as number) / 2 : dur;
                    });
                    this._winTextFields.forEach((obj: TextAutoFit) => {
                        TweenMax.to(obj, dur, { alpha: 1, delay: dur });
                    });
                    this.playCoinShowerIfThereIsAnWin();
                    this.setPlaqueAnimationToOutroAfterDelay();
                } else if (entry.animation.name === BonusWinPlaque.outroAnimationName) {
                    if (this._presentComplete !== undefined) {
                        this._winTextFields[0].renderable = false;
                        this._winTextFields[1].renderable = false;
                        this._presentComplete();
                        this._spineAnim.renderable = false;
                        //this._winTextFields[0].renderable = false;
                        // this._winTextFields[1].renderable = false;
                    }
                }
            },
        });

        this._winThresholdsForBonusGame = this.assets.get(BonusWinPlaque.configName).WinThresholdsForBonusGame;
    }

    private playCoinShowerIfThereIsAnWin() {
        const winRatio = this._winAmount / iwProps.wager;

        //Level 3 coin shower check
        if (this._winThresholdsForBonusGame.level3.lower.inclusive) {
            if (winRatio >= this._winThresholdsForBonusGame.level3.lower.multiplier) {
                soundManager.execute("CoinShower");
                gameStore.actions.revealActions.setWinLevel(3);
            }
        } else if (winRatio > this._winThresholdsForBonusGame.level3.lower.multiplier) {
            soundManager.execute("CoinShower");
            gameStore.actions.revealActions.setWinLevel(3);
        }

        //Level 2 coin shower check
        if (this._winThresholdsForBonusGame.level2.lower.inclusive) {
            if (this._winThresholdsForBonusGame.level2.upper.inclusive) {
                if (
                    this._winThresholdsForBonusGame.level2.upper.multiplier >= winRatio &&
                    this._winThresholdsForBonusGame.level2.lower.multiplier <= winRatio
                ) {
                    soundManager.execute("CoinShower");
                    gameStore.actions.revealActions.setWinLevel(2);
                }
            } else if (
                this._winThresholdsForBonusGame.level2.upper.multiplier > winRatio &&
                this._winThresholdsForBonusGame.level2.lower.multiplier <= winRatio
            ) {
                soundManager.execute("CoinShower");
                gameStore.actions.revealActions.setWinLevel(2);
            }
        } else if (this._winThresholdsForBonusGame.level2.upper.inclusive) {
            if (
                this._winThresholdsForBonusGame.level2.upper.multiplier >= winRatio &&
                this._winThresholdsForBonusGame.level2.lower.multiplier < winRatio
            ) {
                soundManager.execute("CoinShower");
                gameStore.actions.revealActions.setWinLevel(2);
            }
        } else if (
            this._winThresholdsForBonusGame.level2.upper.multiplier > winRatio &&
            this._winThresholdsForBonusGame.level2.lower.multiplier < winRatio
        ) {
            soundManager.execute("CoinShower");
            gameStore.actions.revealActions.setWinLevel(2);
        }

        //Level 1 coin shower check (no coin shower for level 1 for this game)
        if (this._winThresholdsForBonusGame.level1.upper.inclusive) {
            if (this._winThresholdsForBonusGame.level1.upper.multiplier >= winRatio) {
                gameStore.actions.revealActions.setWinLevel(1);
            }
        } else if (this._winThresholdsForBonusGame.level1.upper.multiplier > winRatio) {
            gameStore.actions.revealActions.setWinLevel(1);
        }
    }

    private setPlaqueAnimationToOutroAfterDelay() {
        gameStore.actions.revealActions.setWinPlauqeIsUp(true);
        TweenMax.delayedCall(this._bonusWinPresentationTime, () => {
            const dur: number = 0;

            this._winTextFields.forEach((obj: TextAutoFit) => {
                TweenMax.to(obj, dur, { alpha: 0, delay: dur });
            });
            this._spineAnim.setAnimation(BonusWinPlaque.outroAnimationName, undefined, false);
            gameStore.actions.revealActions.setWinPlauqeIsUp(false);
        });
    }

    private changeWinAmountText(data: { prizeValue: number }): void {
        LayoutUtils.getInstance().changeSpineTextToDifferentTextTexture(
            this._spineAnim,
            "Bonus win text",
            "trans/Bonus win text",
            translationService.getString("messages.bonusPlaqueWin_label") as string,
            600,
            this._winLabelStyle,
            300,
        );
        LayoutUtils.getInstance().changeSpineTextToDifferentTextTexture(
            this._spineAnim,
            "win value",
            "trans/win value",
            currencyService.format(data.prizeValue, iwProps.denomination),
            500,
            this._winValuetextStyle,
            250,
        );
    }

    /**
     * reset
     */
    public reset(): void {}

    public async presentWin(data: { prizeValue: number }): Promise<void> {
        // Straightforward enough, set up a promise
        // Show the plaque
        // Start the countup on showComplete
        // Hide after a short delay
        // Resolve promise on hideComplete
        await new Promise((resolve) => {
            this._presentComplete = resolve;

            this._winAmount = data.prizeValue;
            this._spineAnim.renderable = true;
            this._spineAnim.updateTransform();
            this._spineAnim.setAnimation(BonusWinPlaque.introAnimationName, undefined, false);
            this._spineAnim.addAnimation(BonusWinPlaque.staticLoopAnimationName, undefined, true);
            this._spineAnim.play();
            this._winTextFields[0].text = currencyService.format(this._winAmount, iwProps.denomination);
            this._winTextFields[1].text = translationService.getString("messages.bonusPlaqueWin_label") as string;

            //this.changeWinAmountText(data);
        });
        this._presentComplete = undefined;
    }
}
