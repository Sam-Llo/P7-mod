import { TweenMax } from "gsap";
import { Container } from "pixi.js";
import { MobxUtils, soundManager, SpineAnimation } from "playa-core";
import { ControlActions, ISubGameSettings, iwActions, iwProps, IWProps, SubGame } from "playa-iw";
import { gameStore } from "..";
import { GameIDs } from "../../main";
import { BonusWinPlaque } from "../bonusWinPlaque/BonusWinPlaque";
import { LockAndReelBonusGamePaytable } from "./components/LockAndReelBonusGamePaytable";
import { LockAndReelsController } from "./components/LockAndReelsController";

/**
 * LockAndReelBonusSubGame
 */
export class LockAndReelBonusSubGame extends SubGame {
    private static readonly baseGameVisible: string = "lockAnReelBonusSubGameVisibilitiesChanged";

    public static readonly lockAndReelConfigName = "lockAndReelConfig.json";

    private _config;

    private _handlePlayPromise: any = undefined; //This is needed to pause handle play

    private _handlePlayResolve: any = undefined; //This is needed to pause handle play

    private _handleCheckWinPromise: any = undefined; //This is needed to pause handle check win

    private _handleCheckWinResolve: any = undefined; //This is needed to pause handle check win

    private _bonusWinPlaque!: BonusWinPlaque;

    private _symbolsBonusBackgroundContainer!: Container;

    private _reelSpinCounterParent!: Container;

    //shaded backgrounds
    private _symbolsBonusBackground1!: SpineAnimation;

    private _symbolsBonusBackground2!: SpineAnimation;

    private _symbolsBonusBackground3!: SpineAnimation;

    private _symbolsBonusBackground4!: SpineAnimation;

    private _symbolsBonusBackground5!: SpineAnimation;

    private _symbolsBonusBackground6!: SpineAnimation;

    private _symbolsBonusBackground7!: SpineAnimation;

    private _symbolsBonusBackground8!: SpineAnimation;

    private _symbolsBonusBackground9!: SpineAnimation;

    private _symbolsBonusBackground10!: SpineAnimation;

    private _symbolsBonusBackground11!: SpineAnimation;

    private _symbolsBonusBackground12!: SpineAnimation;

    private _symbolsBonusBackground13!: SpineAnimation;

    private _symbolsBonusBackground14!: SpineAnimation;

    private _symbolsBonusBackground15!: SpineAnimation;

    private _symbolsBonusBackground16!: SpineAnimation;

    private _lockAndReelsController: LockAndReelsController;

    private _lockAndReelBonusGamePaytable!: LockAndReelBonusGamePaytable;

    private _currentFoundDrinksSymbolCount: number;

    constructor(
        parentProps: IWProps,
        parentActions: ControlActions,
        assetIds: string[],
        layoutId: string,
        settings: ISubGameSettings,
    ) {
        super(parentProps, parentActions, assetIds, layoutId, settings);
        this._lockAndReelsController = new LockAndReelsController(this);

        this._bonusWinPlaque = new BonusWinPlaque(parentProps, [BonusWinPlaque.configName], "bonusWinPlaque");
        this._currentFoundDrinksSymbolCount = 0;
    }

    public getCurrentFoundDrinksSymbolCount(): number {
        return this._currentFoundDrinksSymbolCount;
    }

    public setCurrentFoundDrinkSymbolCount(newAmount: number): void {
        this._currentFoundDrinksSymbolCount = newAmount;
    }

    /**
     * init
     */
    protected async init(): Promise<void> {
        super.init();

        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }
        // Build the layout
        this.build(this.layout, new Map(), this.container);

        this._config = this.assets.get(LockAndReelBonusSubGame.lockAndReelConfigName);
        //Grab gameConfig if there are any.
        const gameConfigData = this._config.GameOptions;
        if (gameConfigData && gameConfigData.BonusGridElements !== undefined) {
            this._lockAndReelsController.setBonusGridTotalElementsCount(gameConfigData.BonusGridElements);
        }
        const bonusContainer = this.container.parent.parent.children.find(
            (obj: any) => obj.name === "bonusContainer",
        ) as Container;

        const gameContainer = bonusContainer.parent.children.find(
            (obj: any) => obj.name === "gameContainer",
        ) as Container;

        this._symbolsBonusBackgroundContainer = gameContainer.children.find(
            (obj: any) => obj.name === "symbolsBonusBackground",
        ) as Container;

        this._symbolsBonusBackgroundContainer.renderable = false;

        this.findSymbolShadedGrids();

        const lockAndHoldBonusContainer = bonusContainer.children.find(
            (obj: any) => obj.name === "lockAndHoldBonusContainer",
        ) as Container;

        this._reelSpinCounterParent = lockAndHoldBonusContainer.children.find(
            (obj: any) => obj.name === "spinMeter",
        ) as Container;
        this._reelSpinCounterParent.renderable = false;

        const bonusPayTable = lockAndHoldBonusContainer.children.find(
            (obj) => obj.name === "paytableBonus",
        ) as Container;

        this._lockAndReelBonusGamePaytable = new LockAndReelBonusGamePaytable(bonusPayTable, this);

        // Add orientation change
        this.orientationChanged();
    }

    public getConfig() {
        return this._config;
    }

    private findSymbolShadedGrids() {
        //from 1 to 16 in this case
        for (let i = 1; i <= this._lockAndReelsController.getBonusGridTotalElementsCount(); i++) {
            this[
                `${this._config.SymbolsBonusBackgroundPrefix}${i}`
            ] = this._symbolsBonusBackgroundContainer.children.find(
                (obj: any) => obj.name === `symbolsBonusBackgroundAnim${i}`,
            ) as SpineAnimation;
            this[`${this._config.SymbolsBonusBackgroundPrefix}${i}`].renderable = false;
        }
    }

    public playBonusWinSpineAnimation() {
        this._lockAndReelBonusGamePaytable.playBonusWinSpineAnimation();
    }

    public async onSpinFinished(): Promise<void> {
        if (this._handlePlayResolve !== undefined) {
            await this.artificalDelay(this._config.EndingPresentWinAnimationLength);
            soundManager.execute("BonusMusicStopWin");
            this._handlePlayResolve();
            const prizeValue: number = iwProps.prizeTable.get(`B${this._currentFoundDrinksSymbolCount}`) as number;
            //TODO: might need to play some win effects on the symbols or background, add it here if there are any
            await this._bonusWinPlaque.presentWin({ prizeValue });

            this._handleCheckWinResolve();
            this.setSubGameRevealed();
        } else {
            console.error("LockAndReelBonusSubGame.ts: Fatal logic error _handlePlayResolve is not defined");
        }
    }

    /**
     * handleEntry
     */
    public async handleEntry(): Promise<void> {
        super.handleEntry();
        this._lockAndReelsController.startPlay();
    }

    /**
     * Show
     * @override completely override base class's show, because we want to take control of when to set container to visible
     */
    public show(val: boolean): void {}

    /**
     * Called when the scenario updates on purchasing a ticket. Used to populate the component.
     * @category SubGame Flow Handlers
     */
    public handlePopulate(): void {
        // If this is a GIP, we may have revealed this bonus previously
        const previouslyRevealed: boolean = iwProps.wagerDataSave && iwProps.wagerDataSave.bonusGameRevealed;
        // Here we can check whether we actually need this subGame at all
        // For this, we need to look at gameStore.props.lockAndReelBonusGameData
        if (gameStore.props.isCurrentGameHasLockAndReelBonusGame === false || previouslyRevealed) {
            // If previouslyRevealed, the bonus game has previously been revealed, so set gameProps.bonusGameRevealed back to true
            // Otherwise if we try to restore a second time, the game will just hang
            if (previouslyRevealed) {
                gameStore.actions.revealActions.setBonusGameRevealed(true);
            }
            this.setSubGameRevealed(true);
            return;
        }

        // Create promises that we can resolve when we want, for 'handlePlay()' and 'handleCheckWin()'
        this._handlePlayPromise = new Promise((playResolve, reject) => {
            this._handlePlayResolve = playResolve;
        });
        this._handleCheckWinPromise = new Promise((winResolve, reject) => {
            this._handleCheckWinResolve = winResolve;
        });

        this._lockAndReelsController.initialiseBonusGameGrid();
    }

    public playGridSpaceHighlightAnimation(index: number) {
        this[`${this._config.SymbolsBonusBackgroundPrefix}${index}`].renderable = true;
        this[`${this._config.SymbolsBonusBackgroundPrefix}${index}`].updateTransform();
        this[`${this._config.SymbolsBonusBackgroundPrefix}${index}`].setAnimation(
            this._config.ShadedGridHighlightAnimationName,
        );
        this[`${this._config.SymbolsBonusBackgroundPrefix}${index}`].play();
    }

    /**
     * handlePlay
     * This is effectively a 'state change', when a KNM promise is resolved (i.e. a number card has been revealed)
     * this will return said promise, or resolve completely. This will then run through the IXF states to save wager data
     * On state change complete (onResolveStage), handleCheckWin will be called
     */
    public async handlePlay(): Promise<void> {
        return this._handlePlayPromise;
    }

    /**
     * handleCheckWin
     */
    public async handleCheckWin(): Promise<void> {
        // We need to work out what exactly we need to return
        // If we return an unresolved promise immediately, the whole game will get stuck and not bump through
        // the RDS flow
        // So check that this game is the current subGame - if it isn't, just return Promise.resolve()
        return this.sgProps.active ? this._handleCheckWinPromise : Promise.resolve();
    }

    /**
     * handleReset
     */
    public async handleReset(): Promise<void> {
        super.handleReset();
        this._currentFoundDrinksSymbolCount = 0;
        this._lockAndReelsController.resetlockAndReelSlots();
        this._lockAndReelBonusGamePaytable.reset();
    }

    /**
     * setGameComplete
     */
    private setSubGameRevealed(previouslyRevealed: boolean = false): void {
        // this.sgActions.setActive(false);
        this.sgActions.setRevealed(true); //TODO: Might need to turn this to be true, since we need to set this game as revealed after this game is being completed or this game is not even in the included in the ticket
        // iwActions.controlActions.setRdsDirty(true);
        this._parent.actions.setSubGameRevealed(this);

        if (previouslyRevealed === false) iwActions.controlActions.setActiveGame(GameIDs.BASE_PICK_GAME);
    }

    private async artificalDelay(delayTime: number): Promise<void> {
        await new Promise<void>((resolve) => {
            TweenMax.delayedCall(delayTime, () => {
                resolve();
            });
        });
    }

    public async waitForPaytableDelay(isLastSpin: boolean): Promise<void> {
        await new Promise<void>(async (resolve) => {
            if (
                this._lockAndReelsController.isWinninSymbolsThisTurn() === true &&
                this._lockAndReelBonusGamePaytable.isWin()
            ) {
                await this._lockAndReelBonusGamePaytable.highlightCurrentWinMultiplier();
                resolve();
            } else if (!isLastSpin) {
                //this is not win, but we still have a wait time as defined in this._config.PresentWinAnimationLength
                await this.artificalDelay(this._config.PresentWinAnimationLength);
                resolve();
            } else {
                resolve();
            }
        });
    }

    /**
     * Orientation Reaction
     */
    protected orientationChanged(): void {
        MobxUtils.getInstance().addReaction(
            LockAndReelBonusSubGame.baseGameVisible,
            (): boolean => gameStore.props.baseGameVisible,
            (visible: boolean) => {
                //if base subGame is visible, then this subGame is not visible of cause
                this.showThisGame(!visible);
            },
            { fireImmediately: true },
        );
    }

    private showThisGame(visible: boolean) {
        this.container.visible = visible;
        this._lockAndReelBonusGamePaytable.show(visible);
        this._reelSpinCounterParent.visible = visible;
        this._reelSpinCounterParent.renderable = visible;
        this._symbolsBonusBackgroundContainer.renderable = visible;
        this._symbolsBonusBackgroundContainer.visible = visible;
        if (visible) {
            for (let i = 1; i <= this._lockAndReelsController.getBonusGridTotalElementsCount(); i++) {
                this[`${this._config.SymbolsBonusBackgroundPrefix}${i}`].renderable = false;
                // this[`${this._config.SymbolsBonusBackgroundPrefix}${i}`].visible = false;
            }
        }
    }
}
