import { Ease } from "gsap";
import { loaderService, MobxUtils, Orientation, soundManager, SpineAnimation, systemProps } from "playa-core";
import { Reel } from "./Reel";
import { IOnCompleteCallbacks } from "./IOnCompleteCallbacks";

/**
 * Reel
 */
export class LockAndReel extends Reel {
    private _callsParentOnComplete: boolean = false;

    private _onComplateCallback!: IOnCompleteCallbacks | null;

    private _index: number;

    private _winAnim!: SpineAnimation | undefined;

    public constructor(
        assetIds: string[],
        layoutId: string,
        landingEaseType: Ease,
        configFileName: string,
        autoGenerateMask: boolean,
        onComplateCallback: IOnCompleteCallbacks | null,
    ) {
        super(assetIds, layoutId, landingEaseType, configFileName, autoGenerateMask);
        this._index = parseInt(layoutId.replace(/\D/g, ""), 10);
        this._onComplateCallback = onComplateCallback;
    }

    protected async init(): Promise<void> {
        super.init();
        this.orientationReaction();
    }

    public isTheReelWinningSymbol(symbolToLand: string): boolean {
        return symbolToLand === "1" || symbolToLand === "2" || symbolToLand === "3";
    }

    protected onComplete(): void {
        super.onComplete();
        if (this._callsParentOnComplete === true) {
            if (this._onComplateCallback != null) {
                this._onComplateCallback.onComplete(this._index, this);
            }
        }
    }

    protected presentWin(): void {
        super.presentWin();
        this.showVisuals(false);

        let winningSymbolAnimationNmae: string = this._config.WinningAnimations.Reveal1;
        let winningSymbolsIdleAnimationName: string = this._config.WinningAnimations.Idle1;
        switch (this._landingSymbol) {
            case "1":
                soundManager.execute("onBonusSymbolMatch");
                winningSymbolAnimationNmae = this._config.WinningAnimations.Reveal1;
                winningSymbolsIdleAnimationName = this._config.WinningAnimations.Idle1;
                break;
            case "2":
                soundManager.execute("onBonusSymbolMatch2");
                winningSymbolAnimationNmae = this._config.WinningAnimations.Reveal2;
                winningSymbolsIdleAnimationName = this._config.WinningAnimations.Idle2;
                break;
            case "3":
                soundManager.execute("onBonusSymbolMatch3");
                winningSymbolAnimationNmae = this._config.WinningAnimations.Reveal3;
                winningSymbolsIdleAnimationName = this._config.WinningAnimations.Idle3;
                break;
            default:
                console.error(
                    "LockAndReel.ts: unreachable winning landing symbol index reached, please check your logic",
                );
                break;
        }
        if (this._winAnim !== undefined) {
            this._winAnim.scale.set(0.9, 0.9);
            this._winAnim.renderable = true;
            this._winAnim.updateTransform();
            this._winAnim.setAnimation(winningSymbolAnimationNmae);
            this._winAnim.addAnimation(winningSymbolsIdleAnimationName, undefined, true);
            this._winAnim.play();
        }
    }

    protected orientationReaction() {
        MobxUtils.getInstance().addReaction(
            "lockAndReelOrientationChanged",
            () => systemProps.orientation,
            (orientation: Orientation) => {
                //Called when Orientation got changed
                if (this._winAnim) {
                    if (this._winAnim.renderable) this._winAnim.scale.set(0.9, 0.9);
                }
            },
            { fireImmediately: false, delay: 0.1 },
        );
    }

    public setToCallParentOnComplete(callsParentOnComplete: boolean) {
        this._callsParentOnComplete = callsParentOnComplete;
    }

    public reset() {
        this._callsParentOnComplete = false;
        if (this._winAnim !== undefined) this._winAnim.renderable = false;
        super.reset();
    }

    public isWinningSymbolAlready(): boolean {
        if (this._landingSymbol === "") return false;

        return this._landingSymbol === "1" || this._landingSymbol === "2" || this._landingSymbol === "3";
    }

    public setInitialSymbol(symbolToLand: string): void {
        super.setInitialSymbol(symbolToLand);

        if (this._winAnim === undefined) {
            // Init the spine animations
            this._winAnim = new SpineAnimation(loaderService.fromCache(this._config.BonusWinSpineAnimation));
            this.container.addChild(this._winAnim);
            this._winAnim.renderable = false;
        }
    }
}
