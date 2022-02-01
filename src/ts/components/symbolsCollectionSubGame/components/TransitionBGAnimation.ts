import { TweenMax } from "gsap";
import { loaderService, Orientation, soundManager, SpineAnimation, systemProps } from "playa-core";
import { gameStore } from "../..";
import { BackgroundAudio } from "../../background/BackgroundAudio";
import { LayoutUtils } from "../../utils/LayoutUtils";
import { SymbolsCollectionSubGame } from "../SymbolsCollectionSubGame";

/**
 * TransitionBGAnimation
 */
export class TransitionBGAnimation {
    private _transitionBGAnim!: SpineAnimation;

    private _isWaveTransitionAnimPlaying: boolean = false;

    private _transitionBGAnimPrt!: SpineAnimation;

    private _symbolsCollectionSubGame!: SymbolsCollectionSubGame;

    private static readonly beachyBonusTextPrefabName = "beachyBonusLogoWaveText";

    private static readonly waveMaxHeightCoveredWholeScreenEventName = "maxHeightReached";

    private static readonly waveLandscapeTransitionInAnimationName = "Landscape";

    private static readonly waveLandscapeTransitionOutAnimationName = "Landscape";

    private static readonly wavePortraitTransitionInAnimationName = "Portrait";

    private static readonly wavePotraitTransitionOutAnimationName = "Portrait";

    private static readonly waveSpineAnimationAttachmentName = "beachyBonus";

    private static readonly waveSpineAnimationAttachmentMeshName = "beachyBonus";

    constructor(symbolsCollectionSubGame: SymbolsCollectionSubGame, transitionBGAnim, transitionBGAnimPrt) {
        this._symbolsCollectionSubGame = symbolsCollectionSubGame;
        this._isWaveTransitionAnimPlaying = false;
        this._transitionBGAnim = transitionBGAnim;
        this._transitionBGAnim.renderable = false;
        /*         LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this._transitionBGAnim,
            TransitionBGAnimation.waveSpineAnimationAttachmentName,
            TransitionBGAnimation.waveSpineAnimationAttachmentMeshName,
            loaderService.fromCache(TransitionBGAnimation.beachyBonusTextPrefabName),
        ); */

        this._transitionBGAnimPrt = transitionBGAnimPrt;
        this._transitionBGAnimPrt.renderable = false;
        /*         LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this._transitionBGAnimPrt,
            TransitionBGAnimation.waveSpineAnimationAttachmentName,
            TransitionBGAnimation.waveSpineAnimationAttachmentMeshName,
            loaderService.fromCache(TransitionBGAnimation.beachyBonusTextPrefabName),
        ); */
    }

    public setWaveTransitionVisibilties() {
        if (this._isWaveTransitionAnimPlaying) {
            TweenMax.to([this._transitionBGAnim], 0, { alpha: 1 });
            TweenMax.to([this._transitionBGAnimPrt], 0, { alpha: 1 });

            this._transitionBGAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
            this._transitionBGAnimPrt.renderable = !this._transitionBGAnim.renderable;
        }
    }

    public async playTransitionBG(isTransitionIn: boolean): Promise<void> {
        await new Promise<void>((resolve) => {
            this._isWaveTransitionAnimPlaying = true;
            this.setWaveTransitionVisibilties();
            if (isTransitionIn === true) {
                this._transitionBGAnim.zIndex = 568;
                this._transitionBGAnimPrt.zIndex = 568;
                soundManager.execute("onBonusTransitionIn");
                this._transitionBGAnim.alpha = 1;
                this._transitionBGAnimPrt.alpha = 1;
                this._transitionBGAnim.setAnimation(TransitionBGAnimation.waveLandscapeTransitionInAnimationName);
                this._transitionBGAnimPrt.setAnimation(TransitionBGAnimation.wavePortraitTransitionInAnimationName);
                soundManager.execute(BackgroundAudio.BONUS_MUSIC_START_LOOP);
            } else {
                soundManager.execute("onBonusTransitionOut");
                this._transitionBGAnim.setAnimation(TransitionBGAnimation.waveLandscapeTransitionOutAnimationName);
                this._transitionBGAnimPrt.setAnimation(TransitionBGAnimation.wavePotraitTransitionOutAnimationName);
            }
            this.removeSpineListeners(this._transitionBGAnim);
            this._transitionBGAnim.updateTransform();
            this._transitionBGAnimPrt.updateTransform();
            this._transitionBGAnim.play();
            this._transitionBGAnimPrt.play();
            this._transitionBGAnim.spine.state.addListener({
                event: (entry, event) => {
                    // if (event.data.name === TransitionBGAnimation.waveLandscapeTransitionOutAnimationName) {
                    if (isTransitionIn) {
                        if (gameStore.props.baseGameVisible === true) {
                            gameStore.actions.revealActions.setBaseGameVisible(false);
                        }
                    } else {
                        if (gameStore.props.baseGameVisible === false) {
                            gameStore.actions.revealActions.setBaseGameVisible(true);
                        }

                        this._symbolsCollectionSubGame.setButtonsStates(true, false);
                    }
                    // }
                },
                complete: (entry) => {
                    //TweenMax.delayedCall(
                    //TransitionBGAnimation.DELAY,
                    // () => {
                    //this._transitionBGAnim.renderable = false;
                    //this._transitionBGAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                    //if (this._transitionBGAnimPrt.renderable = !this._transitionBGAnim.renderable)

                    if (systemProps.orientation === Orientation.LANDSCAPE) {
                        TweenMax.to([this._transitionBGAnim], 1, { alpha: 0, renderable: false });
                    } else if (systemProps.orientation === Orientation.PORTRAIT) {
                        TweenMax.to([this._transitionBGAnimPrt], 1, { alpha: 0, renderable: false });
                    }

                    // if (this._transitionBGAnim.alpha === 0) {
                    //this._transitionBGAnim.renderable = false;
                    //}
                    //},
                    // );
                    //  this._transitionBGAnim.renderable = false;
                    // this._transitionBGAnimPrt.renderable = false;
                    this._isWaveTransitionAnimPlaying = false;
                    //enable help and settings button if lastItemRevealed is equal to false
                    if (!isTransitionIn && gameStore.props.lastItemRevealed === false) {
                        gameStore.actions.revealActions.setSettingsButtonEnabled(true);
                    }
                    resolve();
                },
            });
        });
    }

    /**
     * removeSpineListeners
     * //TODO: might need to move this into its own class to get rid of duplicates
     * @param anim
     */
    private removeSpineListeners(anim: SpineAnimation): void {
        for (let i = 0; i < anim.spine.state.listeners.length; i++) {
            anim.spine.state.removeListener(anim.spine.state.listeners[i]);
        }
    }
}
