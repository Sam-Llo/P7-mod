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

    private static readonly waveLandscapeTransitionInAnimationName = "ScreenTransitionLandscape";

    private static readonly waveLandscapeTransitionOutAnimationName = "ScreenTransitionLandscape";

    private static readonly wavePortraitTransitionInAnimationName = "ScreenTransitionPortrait";

    private static readonly wavePotraitTransitionOutAnimationName = "ScreenTransitionPortrait";

    private static readonly waveSpineAnimationAttachmentName = "beachyBonus";

    private static readonly waveSpineAnimationAttachmentMeshName = "beachyBonus";

    constructor(symbolsCollectionSubGame: SymbolsCollectionSubGame, transitionBGAnim, transitionBGAnimPrt) {
        this._symbolsCollectionSubGame = symbolsCollectionSubGame;
        this._isWaveTransitionAnimPlaying = false;
        this._transitionBGAnim = transitionBGAnim;
        this._transitionBGAnim.renderable = false;
        LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this._transitionBGAnim,
            TransitionBGAnimation.waveSpineAnimationAttachmentName,
            TransitionBGAnimation.waveSpineAnimationAttachmentMeshName,
            loaderService.fromCache(TransitionBGAnimation.beachyBonusTextPrefabName),
        );

        this._transitionBGAnimPrt = transitionBGAnimPrt;
        this._transitionBGAnimPrt.renderable = false;
        LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this._transitionBGAnimPrt,
            TransitionBGAnimation.waveSpineAnimationAttachmentName,
            TransitionBGAnimation.waveSpineAnimationAttachmentMeshName,
            loaderService.fromCache(TransitionBGAnimation.beachyBonusTextPrefabName),
        );
    }

    public setWaveTransitionVisibilties() {
        if (this._isWaveTransitionAnimPlaying) {
            this._transitionBGAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
            this._transitionBGAnimPrt.renderable = !this._transitionBGAnim.renderable;
        }
    }

    public async playTransitionBG(isTransitionIn: boolean): Promise<void> {
        await new Promise<void>((resolve) => {
            this._isWaveTransitionAnimPlaying = true;
            this.setWaveTransitionVisibilties();
            if (isTransitionIn === true) {
                soundManager.execute("onBonusTransitionIn");
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
                    if (event.data.name === TransitionBGAnimation.waveMaxHeightCoveredWholeScreenEventName) {
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
                    }
                },
                complete: (entry) => {
                    // Add listener for match animation complete, it'll then start the looping animation
                    this._transitionBGAnim.renderable = false;
                    this._transitionBGAnimPrt.renderable = false;
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
