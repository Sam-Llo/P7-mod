import { Ease } from "gsap";
import { Reel } from "./Reel";

/**
 * PausableReel
 */
export class PausableReel extends Reel {
    private _pauseInMiddle = false;

    public constructor(
        assetIds: string[],
        layoutId: string,
        landingEaseType: Ease,
        configFileName: string,
        autoGenerateMask: boolean,
    ) {
        super(assetIds, layoutId, landingEaseType, configFileName, autoGenerateMask);
        this._pauseInMiddle = false;
    }

    protected modifySpinCounterAndSpeed() {
        this.setFirstElementToBeTheWinningSymbol();
        if (this._pauseInMiddle) {
            //-1 this is to count for we spin count from 0 instead of 1
            if (this._halfSpinCount === this._currentSpinCounter && this._isReelLanding === false) {
                //Don't show the landing (slow down spin speed from peak) if this reel is not landing yet.
                return;
            }
        }

        this._currentSpinCounter++;
        this.changeSpeedBasedCurrentCounter();

        this.checkForEndOfSpin();
    }

    public spinWithoutLanding() {
        //If game is in last step of move to money, and player clicks the propmt with "Move to Moneny", this will gets called again.
        if (this.isInSpinWithoutStopState()) return;
        //We will have issue of this sound being heard
        this.reset();
        this._pauseInMiddle = true;
        if (this._config.IsHorizontalSpin) {
            this.spinHorizontally();
        } else {
            this.spinVertically();
        }
    }

    public reset(): void {
        this._pauseInMiddle = false;
        super.reset();
    }

    /**
     * spin
     * @param symbolToLand the index of elements that this spin will lands on
     */
    public land(symbolToLand: string): void {
        this._landingSymbol = symbolToLand;
        this._isReelLanding = true;
    }

    //Used to tell which state this reel is at. can be used to prevent double spin
    private isInSpinWithoutStopState(): boolean {
        return this._pauseInMiddle && !this._isReelLanding;
    }
}
