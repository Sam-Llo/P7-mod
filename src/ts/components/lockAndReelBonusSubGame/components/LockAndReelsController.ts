import { Ease, TweenMax } from "gsap";
import { ParentDef, soundManager } from "playa-core";
import { gameStore } from "../..";
import { LockAndReelBonusSubGame } from "../LockAndReelBonusSubGame";
import { IOnCompleteCallbacks } from "./IOnCompleteCallbacks";
import { LockAndReel } from "./LockAndReel";
import { ReelSpinCounter } from "./ReelSpinCounter";

/**
 * LockAndReelsController
 */
export class LockAndReelsController implements IOnCompleteCallbacks {
    private _reels: LockAndReel[] = [];

    private _reelSpinCounter!: ReelSpinCounter;

    private _spinCounter!: number;

    private _bonusGridTotalElementsCount: number;

    private _lockAndReelSubGame: LockAndReelBonusSubGame;

    private _currentTurnSpinTotalAmount!: number;

    private _currentTurnFinishedSpinAmount!: number;

    private _isWinninSymbolsThisTurn = false;

    constructor(lockAndReelSubGame: LockAndReelBonusSubGame) {
        this._lockAndReelSubGame = lockAndReelSubGame;
        this._reels = [];
        this._spinCounter = 0;
        this._bonusGridTotalElementsCount = 16;
        this.createReelComponents();

        this.createReelSpinCounterComponent();
    }

    public setBonusGridTotalElementsCount(num: number) {
        this._bonusGridTotalElementsCount = num;
    }

    public getBonusGridTotalElementsCount() {
        return this._bonusGridTotalElementsCount;
    }

    public isWinninSymbolsThisTurn(): boolean {
        return this._isWinninSymbolsThisTurn;
    }

    private createReelComponents(): void {
        for (let i = 0; i < this._bonusGridTotalElementsCount; i++) {
            const index = i + 1;
            const layoutContainerName = `reel${index}`;

            this._reels[i] = new LockAndReel(
                [LockAndReelBonusSubGame.lockAndReelConfigName],
                layoutContainerName,
                new Ease(),
                LockAndReelBonusSubGame.lockAndReelConfigName,
                false,
                this,
            );
        }
    }

    private createReelSpinCounterComponent(): void {
        this._reelSpinCounter = new ReelSpinCounter(
            new ParentDef(null, null),
            {},
            undefined,
            [ReelSpinCounter.reelSpinCounterConfigName, ReelSpinCounter.lockAndReelConfigName],
            "spinMeter",
        );
    }

    /**
     * start play
     */
    public async startPlay(): Promise<void> {
        //TODO: might need to put the below reset in handleReset(), if there are issues pop up regarding this
        this._reelSpinCounter.reset();

        TweenMax.delayedCall(
            this._lockAndReelSubGame.getConfig().GameOptions.InitialDelayToSetSpinCounterInSeconds,
            () => {
                this._reelSpinCounter.playSpinMeterAnimation(true);
                TweenMax.delayedCall(
                    this._lockAndReelSubGame.getConfig().GameOptions.InitialDelaySpinTimeInSeconds,
                    () => {
                        this.spin();
                    },
                );
            },
        );
    }

    public initialiseBonusGameGrid() {
        this._spinCounter = 0;
        for (let i = 0; i < this._bonusGridTotalElementsCount; i++) {
            this._reels[i].setInitialSymbol(gameStore.props.lockAndReelBonusGameData[this._spinCounter][i]);
        }
    }

    /**
     * resetlockAndReelSlots
     * TODO: might need this
     */
    public resetlockAndReelSlots(): void {
        for (let i = 0; i < this._reels.length; i++) {
            this._reels[i].reset();
        }
    }

    private async spin(): Promise<void> {
        soundManager.execute("onBonusSymbolSpin");
        this._currentTurnSpinTotalAmount = 0;
        this._currentTurnFinishedSpinAmount = 0;

        this._spinCounter++;
        this._isWinninSymbolsThisTurn = false;
        for (let j = 0; j < this._bonusGridTotalElementsCount; j++) {
            if (
                this._isWinninSymbolsThisTurn === false &&
                this._reels[j].isWinningSymbolAlready() === false &&
                this._reels[j].isTheReelWinningSymbol(
                    gameStore.props.lockAndReelBonusGameData[this._spinCounter][j],
                ) === true
            ) {
                this._isWinninSymbolsThisTurn = true;
            }

            //New One, we don't keep spin if it is already a winning symbol
            if (this._reels[j].isWinningSymbolAlready() === false) {
                let delay = 0;
                if (this._lockAndReelSubGame.getConfig().GameOptions.IsSequenceSpin) {
                    delay =
                        this._lockAndReelSubGame.getConfig().DelayBetweenNextSpinStarts *
                        this._currentTurnSpinTotalAmount;
                } else {
                    delay = Math.random() * this._lockAndReelSubGame.getConfig().RandomRangeForReelSpinDelays;
                }
                TweenMax.delayedCall(delay, () => {
                    this._reels[j].land(gameStore.props.lockAndReelBonusGameData[this._spinCounter][j]);
                    this._reels[j].setToCallParentOnComplete(true);
                });
                this._currentTurnSpinTotalAmount++;
            }
        }

        this._reelSpinCounter.playSpinMeterAnimation(false);
    }

    private increaseMultiplayerCountBasedOnCurrentSpinResult() {
        let newFoundDrinksCount = 0;
        for (let i = 0; i < this._bonusGridTotalElementsCount; i++) {
            //Increase the lockAdnHoldGameMultiplierCount at the end
            const isNumber: boolean = /^\d+$/.test(gameStore.props.lockAndReelBonusGameData[this._spinCounter][i]);
            if (isNumber) {
                const multiplierCount = parseInt(gameStore.props.lockAndReelBonusGameData[this._spinCounter][i], 10);
                newFoundDrinksCount += multiplierCount;
            }
        }
        this._lockAndReelSubGame.setCurrentFoundDrinkSymbolCount(newFoundDrinksCount);
    }

    public async onComplete(index: number, lockAndReel: LockAndReel) {
        if (lockAndReel.isWinningSymbolAlready()) {
            this._lockAndReelSubGame.playGridSpaceHighlightAnimation(index);
        }
        this._currentTurnFinishedSpinAmount++;
        if (this._currentTurnFinishedSpinAmount !== this._currentTurnSpinTotalAmount) return;
        soundManager.execute("StopBonusSpinSound");
        this.increaseMultiplayerCountBasedOnCurrentSpinResult();
        if (this._isWinninSymbolsThisTurn === true) {
            this._lockAndReelSubGame.playBonusWinSpineAnimation();
            this._reelSpinCounter.playSpinMeterAnimation(true);
        }

        await this._lockAndReelSubGame.waitForPaytableDelay(this.isLastSpin());
        //Since first one does not get spined, it just show and spins from frist(0 indexed)
        if (this.isLastSpin() === false) {
            this.spin();
        } else {
            this._lockAndReelSubGame.onSpinFinished();
        }
    }

    private isLastSpin(): boolean {
        return this._spinCounter >= gameStore.props.lockAndReelBonusGameData.length - 1;
    }
}
