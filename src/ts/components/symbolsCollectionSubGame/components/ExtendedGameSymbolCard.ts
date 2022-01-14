import { currencyService, SpineAnimation, TextAutoFit, translationService } from "playa-core";
import { iwProps, SubGameActions } from "playa-iw";
import { gameStore } from "../..";
import { IGameSymbolData } from "../../store/GameData";
import { GameSymbolCard } from "../../symbolsCollectionComponent/components/GameSymbolCard";
import { SymbolsCollectionActions } from "../../symbolsCollectionComponent/SymbolsCollectionActions";
import { SymbolsCollectionProps } from "../../symbolsCollectionComponent/SymbolsCollectionProps";
import { SymbolsCollectionSubGame } from "../SymbolsCollectionSubGame";
import { ExtendedGameSymbolCardAnimationsControl } from "./ExtendedGameSymbolCardAnimationsControl";

/**
 * ExtendedGameSymbolCard
 */
export class ExtendedGameSymbolCard extends GameSymbolCard {
    private _textStyle;

    private instantWinWinningValueText!: TextAutoFit | undefined;

    private _parent: { actions: SymbolsCollectionActions; props: SymbolsCollectionProps; sgActions: SubGameActions };

    private _gameSymbolsConfig: any;

    private _hasBeenReset: boolean;

    private _animationControl!: ExtendedGameSymbolCardAnimationsControl;

    public constructor(
        gameSymbolsConfig: any,
        parent: { actions: SymbolsCollectionActions; props: SymbolsCollectionProps; sgActions: SubGameActions },
    ) {
        super();

        // Store the parent props
        this._parent = {
            actions: parent.actions,
            props: parent.props,
            sgActions: parent.sgActions,
        };

        // Store the config
        this._gameSymbolsConfig = gameSymbolsConfig;

        this._hasBeenReset = false;
    }

    /**
     * init
     */
    public init(): void {
        // Init the spine animation
        const coverAnim = this.children.find((child): any =>
            child.name.startsWith(this._gameSymbolsConfig.CoverSpinePrefix),
        ) as SpineAnimation;

        const winGlowAnim = this.children.find((child): any =>
            child.name.startsWith("win_glow_anim"),
        ) as SpineAnimation;

        const frameCoverAnim = this.children.find((child): any =>
            child.name.startsWith("frameCoverAnims"),
        ) as SpineAnimation;

        // Init the match animation
        const matchAnim = this.children.find((child): any =>
            child.name.startsWith(this._gameSymbolsConfig.MatchSpinePrefix),
        ) as SpineAnimation;

        this._animationControl = new ExtendedGameSymbolCardAnimationsControl(
            this,
            this._gameSymbolsConfig,
            coverAnim,
            frameCoverAnim,
            winGlowAnim,
            matchAnim,
        );

        // Specify the hitArea
        //TODO: needs to be set to the half width and height of the current symbol's field
        this.setHitArea({
            x: -this._gameSymbolsConfig.SymbolWidth / 2,
            y: -this._gameSymbolsConfig.SymbolHeight / 2,
            width: this._gameSymbolsConfig.SymbolWidth,
            height: this._gameSymbolsConfig.SymbolHeight,
        });
        this._textStyle = translationService.getStyle("chestValueTextStyleGridSpace") as object;
    }

    /**
     * setMatchAnimRenderable
     * @param renderable
     * @override
     */
    public setMatchAnimRenderable(renderable: boolean) {
        this._animationControl.setMatchAnimRenderable(renderable);
    }

    /**
     * populate
     * @param data
     * Used to set game symbol card data, for example number sprite and prize value text
     * Called after got clicked
     */
    public populate(symbol: string): void {
        //Bijian's Note : this method is being called by its parent class automatically when got clicked specified by its hit area.
        //Bijian's Note : the data will come from server scenerio data
        this.symbol = symbol;
        this._hasBeenReset = false;
    }

    /**
     * reset
     * Clear number sprites and text fields
     */
    public reset(): void {
        if (this._hasBeenReset === true) return;
        this._hasBeenReset = true;
        super.reset();
        this.destoryInstantWinnningValueTextIfThereAreAny();
        this._animationControl.reset(this.isSpecialCase());

        this.symbol = "";
        this.revealed = false;
    }

    /**
     * uncover
     * called after this.populate()
     * @returns Promise<void>
     */
    public async uncover(): Promise<void> {
        await new Promise<void>(async (resolve) => {
            this._parent.sgActions.stopIdle();
            this.bringToFront();
            this.revealed = true;

            await this._animationControl.playUncoverAnimation();
            resolve();
        });
    }

    /**
     * rollover
     * mouse over
     */
    protected rollover(): void {
        this._parent.sgActions.stopIdle();
        this._animationControl.playRolloverAnimation();
    }

    public afterPresentWin(winAmount: number): void {
        this.displayChestWinAmountOnGridSpace(winAmount);
    }

    /**
     * rollout
     * mouse out
     */
    protected rollout(): void {
        this._animationControl.playRolloutAnimation();
    }

    /**
     * setStatic
     */
    public setStatic(): void {
        if (this.revealed === true) return;

        this._animationControl.playStaticAnimation();
    }

    /**
     * startIdle
     */
    protected startIdle(): void {
        if (this.revealed === true) return; //Set static got called after restoring the previous player left but revealed items, but this one
        this._animationControl.playIdleAnimation();
    }

    /**
     * stopIdle
     */
    protected stopIdle(): void {
        this._animationControl.playStaticAnimation();
    }

    /**
     * canTriggerIdle
     */
    public canTriggerIdle(): boolean {
        // We can only trigger the idle animations if we're not doing something else i.e. mouseover
        return !this.revealed && this._animationControl.isCoverAnimationInStaticState() === true;
    }

    /**
     * presentWin
     * @returns Promise<void>
     */
    public async presentWin(playWInAnm: boolean = false, waitForDelay: boolean = false): Promise<void> {
        await new Promise<void>((resolve) => {
            //TODO: might not need to play glow animation if we are in manual play, since manual play got glow be default.
            if (playWInAnm) {
                if (waitForDelay) {
                    this._animationControl.playWinGlowAnimation(waitForDelay, resolve);
                } else {
                    this._animationControl.playWinGlowAnimation(waitForDelay, resolve);
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }

    /**
     * Play Bonus animation then start transition wave after  number of drink glass shakes
     * @param numerOfShakes number of shakes after trigger transition wave
     */
    public async playBonusWinAnimation(numerOfShakes: number) {
        await new Promise<void>(async (resolve) => {
            await this._animationControl.playBonusWinAnimation(numerOfShakes);
            resolve();
        });
    }

    /**
     * quickReveal
     * triggered if this symbol card has been revealed before player left the game
     * this method is used to show the content without winning.
     */
    public quickReveal(data: IGameSymbolData): void {
        //Bijian's note, quick-revealing because of resuming a game in progrss
        //Bijian's note, this got called when iw data received to reveal the block, because this number got revealed before player left.
        this.enabled = false;
        this.revealed = true;

        // Set number
        this.populate(data.symbol);

        //get Cover animation to play
        this._parent.sgActions.stopIdle();
        this.bringToFront();
        this._animationControl.quickRevealForCoverAnimation();
    }

    /**
     * quickRevealSpine
     * show the matching anim immediately be use enable it
     */
    public quickRevealSpine(): void {
        // Basically, we are quick-revealing this card after resuming a Game In Progress
        // We need to make sure the match anim is alpha 1, as it will not be normally at this point
        this._animationControl.quickRevealSpineAnimation();
        // this.uncover(0);
        this._parent.sgActions.resetIdle();

        if (this.isInstantWin()) {
            const index = SymbolsCollectionSubGame.INSTANT_WIN_SYMBOLS_ARRAY.indexOf(this.symbol);
            //plug the found index into INSTANT_WIN_PRIZE_DIVISIONS_ARRAY to find the winning division string
            const winAmount = iwProps.prizeTable.get(
                SymbolsCollectionSubGame.INSTANT_WIN_PRIZE_DIVISIONS_ARRAY[index],
            ) as number;
            this.displayChestWinAmountOnGridSpace(winAmount);
        }
    }

    public isLockAndReelBonusGame(): boolean {
        return SymbolsCollectionSubGame.LOCK_AND_REEL_BONUS_GAME_SYMBOL === this.symbol;
    }

    public isWinningSymbol(): boolean {
        return SymbolsCollectionSubGame.WINNING_SYMBOLS_ARRAY.includes(this.symbol);
    }

    public isInstantWin(): boolean {
        return SymbolsCollectionSubGame.INSTANT_WIN_SYMBOLS_ARRAY.includes(this.symbol);
    }

    public isSpecialCase(): boolean {
        return this.isWinningSymbol() || this.isInstantWinOrLockAndReelBonusWin();
    }

    public isInstantWinOrLockAndReelBonusWin(): boolean {
        return this.isInstantWin() || this.isLockAndReelBonusGame();
    }

    public resetIdleAnimationIfNeeded(): void {
        //Manually play case cover, We only reset Idle when reveal all control is enabled, if disabled, it means bonus game or Iw game is in progress
        if (gameStore.props.revealAllControlEnabled) this._parent.sgActions.resetIdle();
    }

    private displayChestWinAmountOnGridSpace(winAmount: number) {
        this.destoryInstantWinnningValueTextIfThereAreAny();

        this.instantWinWinningValueText = new TextAutoFit(
            currencyService.format(winAmount, iwProps.denomination),
            this._textStyle,
            undefined,
            false,
        );
        this.instantWinWinningValueText.anchor.set(0.5, 0.5);
        this.addChild(this.instantWinWinningValueText);
        this.instantWinWinningValueText.position.set(0, 0);
        // this.instantWinWinningValueText.renderable = false;
    }

    private destoryInstantWinnningValueTextIfThereAreAny() {
        if (this.instantWinWinningValueText) {
            this.instantWinWinningValueText.destroy();
            this.instantWinWinningValueText = undefined;
        }
    }
}
