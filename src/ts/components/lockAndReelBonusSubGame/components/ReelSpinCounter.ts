import { Elastic, TimelineMax } from "gsap";
import { Container } from "pixi.js";
import { BaseView, soundManager, TextAutoFit } from "playa-core";

/**
 * ReelSpinCounter
 */
export class ReelSpinCounter extends BaseView<any, null, any, null> {
    public static readonly lockAndReelConfigName = "lockAndReelConfig.json";

    public static readonly reelSpinCounterConfigName = "spinCounterConfig.json";

    private _reelSpinCounterConfig;

    private _lockAndReelSubGameConfig;

    private _reel0!: TextAutoFit;

    private _reel1!: TextAutoFit;

    private _reel2!: TextAutoFit;

    private _reel3!: TextAutoFit;

    private _currentShowIndex!: number;

    private _currentSpinCounterNumber: number = 3;

    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build the layout
        this.build(this.layout, new Map(), this.container);

        this._reelSpinCounterConfig = this.assets.get(ReelSpinCounter.reelSpinCounterConfigName);
        this._lockAndReelSubGameConfig = this.assets.get(ReelSpinCounter.lockAndReelConfigName);
        const spinMeterValuesContainer: Container = this.container.children.find((obj: any) =>
            obj.name.startsWith("spinMeterValues"),
        ) as Container;
        const reelSpinCounterReel0: TextAutoFit = spinMeterValuesContainer.children.find((obj: any) =>
            obj.name.startsWith("spinMeter_value_0"),
        ) as TextAutoFit;
        const reelSpinCounterReel1: TextAutoFit = spinMeterValuesContainer.children.find((obj: any) =>
            obj.name.startsWith("spinMeter_value_1"),
        ) as TextAutoFit;
        const reelSpinCounterReel2: TextAutoFit = spinMeterValuesContainer.children.find((obj: any) =>
            obj.name.startsWith("spinMeter_value_2"),
        ) as TextAutoFit;
        const reelSpinCounterReel3: TextAutoFit = spinMeterValuesContainer.children.find((obj: any) =>
            obj.name.startsWith("spinMeter_value_3"),
        ) as TextAutoFit;

        this._reel0 = reelSpinCounterReel0;
        this._reel1 = reelSpinCounterReel1;
        this._reel2 = reelSpinCounterReel2;
        this._reel3 = reelSpinCounterReel3;
        const maskGraphics = new PIXI.Graphics();
        maskGraphics.beginFill(0xffffff);
        maskGraphics.drawRect(
            0 - this._reelSpinCounterConfig.SymbolWidth / 2,
            0 - this._reelSpinCounterConfig.SymbolHeight / 2,
            this._reelSpinCounterConfig.SymbolWidth, //TOOD: might need to add more offset if it got cut off.
            this._reelSpinCounterConfig.SymbolHeight, //TOOD: might need to add more offset if it got cut off.
        );

        maskGraphics.endFill();
        spinMeterValuesContainer.addChild(maskGraphics);
        spinMeterValuesContainer.mask = maskGraphics;
        this.reset();
    }

    public reset(): void {
        this._currentSpinCounterNumber = this._lockAndReelSubGameConfig.GameOptions.MaxSpinCounterNumber;
        this._currentShowIndex = 0;
        this.onlyShownTheCurrentVisibleNumber();
        this.playSpinMeterAnimation(false, true); //Reset the spin meter back to 0 for next game start
    }

    /*
     * playSpinMeterAnimation
     * Play spin meter animation (from, to)
     */
    public playSpinMeterAnimation(isBackToMaxNumber: boolean, isBackToMinNumber: boolean = false): void {
        let targetNum = 0;
        if (isBackToMaxNumber === true) {
            soundManager.execute("onBonusTurnsIncrease");
            targetNum = this._lockAndReelSubGameConfig.GameOptions.MaxSpinCounterNumber;
            this._currentSpinCounterNumber = targetNum;
        } else if (isBackToMinNumber === false) {
            //TODO: might not need to play turn decrease sound
            soundManager.execute("onBonusTurnsDecrease");
            this._currentSpinCounterNumber--;
            targetNum = this._currentSpinCounterNumber;
        } else {
            this._currentSpinCounterNumber = 0;
            targetNum = this._currentSpinCounterNumber;
        }

        const currentPosYReel0 = 0 + (this._currentShowIndex - 0) * this._reelSpinCounterConfig.SymbolHeight;
        const currentPosYReel1 = 0 + (this._currentShowIndex - 1) * this._reelSpinCounterConfig.SymbolHeight;
        const currentPosYReel2 = 0 + (this._currentShowIndex - 2) * this._reelSpinCounterConfig.SymbolHeight;
        const currentPosYReel3 = 0 + (this._currentShowIndex - 3) * this._reelSpinCounterConfig.SymbolHeight;
        const targetPosYReel0 = 0 + this._reelSpinCounterConfig.SymbolHeight * (targetNum - 0);
        const targetPosYReel1 = 0 + this._reelSpinCounterConfig.SymbolHeight * (targetNum - 1);
        const targetPosYReel2 = 0 + this._reelSpinCounterConfig.SymbolHeight * (targetNum - 2);
        const targtePosYReel3 = 0 + this._reelSpinCounterConfig.SymbolHeight * (targetNum - 3);

        this.setEveryNumbersToBeVisible();
        const timeLine = new TimelineMax();

        //Vertical spin
        timeLine.fromTo(
            this._reel0.position,
            this._lockAndReelSubGameConfig.PresentWinAnimationLength,
            {
                x: this._reel0.position.x,
                y: currentPosYReel0,
            },
            {
                x: this._reel0.position.x,
                y: targetPosYReel0,
                ease: Elastic.easeOut,
            },
            "0",
        );
        timeLine.fromTo(
            this._reel1.position,
            this._lockAndReelSubGameConfig.PresentWinAnimationLength,
            {
                x: this._reel1.position.x,
                y: currentPosYReel1,
            },
            {
                x: this._reel1.position.x,
                y: targetPosYReel1,
                ease: Elastic.easeOut,
            },
            "0",
        );
        timeLine.fromTo(
            this._reel2.position,
            this._lockAndReelSubGameConfig.PresentWinAnimationLength,
            {
                x: this._reel2.position.x,
                y: currentPosYReel2,
            },
            {
                x: this._reel2.position.x,
                y: targetPosYReel2,
                ease: Elastic.easeOut,
            },
            "0",
        );
        timeLine.fromTo(
            this._reel3.position,
            this._lockAndReelSubGameConfig.PresentWinAnimationLength,
            {
                x: this._reel3.position.x,
                y: currentPosYReel3,
            },
            {
                x: this._reel3.position.x,
                y: targtePosYReel3,
                ease: Elastic.easeOut,
            },
            "0",
        );
        this._currentShowIndex = targetNum;
        this.onlyShownTheCurrentVisibleNumber();
    }

    private setEveryNumbersToBeVisible() {
        this._reel0.renderable = false;
        this._reel1.renderable = false;
        this._reel2.renderable = false;
        this._reel3.renderable = false;
    }

    private onlyShownTheCurrentVisibleNumber() {
        switch (this._currentShowIndex) {
            case 0:
                this._reel0.renderable = true;
                this._reel1.renderable = false;
                this._reel2.renderable = false;
                this._reel3.renderable = false;
                break;
            case 1:
                this._reel0.renderable = false;
                this._reel1.renderable = true;
                this._reel2.renderable = false;
                this._reel3.renderable = false;
                break;
            case 2:
                this._reel0.renderable = false;
                this._reel1.renderable = false;
                this._reel2.renderable = true;
                this._reel3.renderable = false;
                break;
            case 3:
                this._reel0.renderable = false;
                this._reel1.renderable = false;
                this._reel2.renderable = false;
                this._reel3.renderable = true;
                break;
            default:
                console.error("ReelSpinCounter.ts, fatal error, currentShowIndex out of range issue");
        }
    }
}
