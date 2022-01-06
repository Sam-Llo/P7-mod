import { TimelineMax } from "gsap";
import { loaderService, soundManager } from "playa-core";
import { IOnCompleteCallbacks } from "../../lockAndReelBonusSubGame/components/IOnCompleteCallbacks";
import { PausableReel } from "../../lockAndReelBonusSubGame/components/PausableReel";

/**
 * InitialSymbolSelectionReel
 * Used as a sinle cell that presents a single column spinning, consider create a list of them for a
 */
export class InitialSymbolSelectionReel extends PausableReel {
    private _pulsingAnimationTimeline!: TimelineMax;

    private _onComplateCallback!: IOnCompleteCallbacks | undefined;

    protected setUpSymbolsTextureNameMap(): void {
        this._symbolsTextureNameMap = new Map<string, string>();
        this._symbolsTextureNameMap.set("A", "palmTree");
        this._symbolsTextureNameMap.set("B", "sun");
        this._symbolsTextureNameMap.set("C", "iceCream");
        this._symbolsTextureNameMap.set("D", "starFish");
    }

    presentWin(): void {}

    onComplete(): void {
        super.onComplete();
        soundManager.execute("onSymbolSelected");
        this.playPulsingAnimation();
        if (this._onComplateCallback !== undefined) {
            this._onComplateCallback.onComplete(0, undefined);
        }
    }

    public playPulsingAnimation() {
        if (this._pulsingAnimationTimeline) this._pulsingAnimationTimeline.kill();
        //Reset the scale
        this.container.scale.set(1, 1);
        this._pulsingAnimationTimeline = new TimelineMax();
        this._pulsingAnimationTimeline.fromTo(this.container.scale, 0.5, { x: 1, y: 1 }, { x: 1.5, y: 1.5 });
        this._pulsingAnimationTimeline.fromTo(this.container.scale, 0.5, { x: 1.5, y: 1.5 }, { x: 1, y: 1 });
    }

    public landAndSetOnCompleteCallback(landingSymbol: string, onCompleteCallback: IOnCompleteCallbacks) {
        this._onComplateCallback = onCompleteCallback;
        this.land(landingSymbol);
    }

    public spinWithoutLanding() {
        super.spinWithoutLanding();
    }

    public setLandingSymbolWithoutSpin(landingSymbol: string) {
        this.showVisuals(false);
        this._reel1.renderable = true;
        this._reel1.visible = true;
        this._reel1.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(landingSymbol) as string);
    }

    public reset(): void {
        super.reset();
    }
}
