import { TweenMax } from "gsap";
import { BounceParticle, EmitterBaseComponent, MobxUtils, SystemProps } from "playa-core";
import { gameStore } from "..";

/**
 * This is am example of a coin show particle component.
 * You need to add the "coinShower.json" into your assets/.../config folder.
 * See gameComponent/particles/baseComponent/README.md for more details.
 *
 * @export
 * @class CoinShowerEmitter
 * @extends {EmitterBaseComponent}
 */
export class CoinShowerEmitter extends EmitterBaseComponent {
    public static readonly winLevelReaction: string = "CoinShowerEmitter_WinLevel";

    public static readonly maxCoinShowerPlayTime: number = 5;

    protected _particleConstructor = BounceParticle;

    private _winLevel: number;

    // example : optionaly you can set the assetConfig manualy, if not set it will use the assets from layout tool.
    // protected _assetConfig: any[] = [
    //     {
    //         framerate: 30,
    //         loop: false,
    //         textures: ["D-T-Coin-Spin-01.png", "D-T-Coin-Spin-02.png", "D-T-Coin-Spin-03.png", "D-T-Coin-Spin-04.png", "D-T-Coin-Spin-05.png"],
    //     },
    // ];

    public constructor(parentProps: SystemProps, layoutId: string, winLevel: number) {
        super(parentProps, layoutId, ["coinShowerConfig.json"]);
        this._winLevel = winLevel || 1;
    }

    protected init(): Promise<void> {
        MobxUtils.getInstance().addReaction(
            CoinShowerEmitter.winLevelReaction,
            () => gameStore.props.winLevel,
            (winLevel) => {
                if (winLevel >= this._winLevel) {
                    this.startEmitter();
                    this.stopAfterTimer();
                } else {
                    this.stopEmitter();
                }
            },
        );

        return super.init();
    }

    private stopAfterTimer() {
        TweenMax.delayedCall(CoinShowerEmitter.maxCoinShowerPlayTime, () => {
            this.stopEmitter();
        });
    }
}
