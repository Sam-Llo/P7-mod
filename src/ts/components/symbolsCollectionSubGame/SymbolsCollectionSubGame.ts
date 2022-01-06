import { TimelineMax, TweenMax } from "gsap";
import { MobxUtils, Orientation, soundManager, SpineAnimation, systemProps } from "playa-core";
import { ControlActions, ISubGameSettings, iwActions, iwProps, IWProps, RevealAllState, SubGame } from "playa-iw";
import { gameStore } from "..";
import { Container } from "pixi.js";
import { Chest } from "../chest/Chest";
import { IGameSymbolData } from "../store/GameData";
import { GameSymbolCard } from "../symbolsCollectionComponent/components/GameSymbolCard";
import { SymbolCard } from "../symbolsCollectionComponent/components/SymbolCard";
import { SymbolsCollectionComponent } from "../symbolsCollectionComponent/SymbolsCollectionComponent";
import { ExtendedGameSymbolCard } from "./components/ExtendedGameSymbolCard";
import { GameIDs } from "../../main";
import { TransitionBGAnimation } from "./components/TransitionBGAnimation";

/**
 * SymbolsCollectionSubGame
 */
export class SymbolsCollectionSubGame extends SymbolsCollectionComponent {
    private static readonly baseGameVisible: string = "symbolsCollectionBaseGameVisible";

    private static readonly orientationChangedReaction: string = "symbolsCollectionBaseGameOrientationChanged";

    public static readonly WINNING_SYMBOLS_ARRAY: string[] = ["1", "2", "3"];

    public static readonly INSTANT_WIN_SYMBOLS_ARRAY: string[] = ["X", "Y", "Z"];

    public static readonly INSTANT_WIN_PRIZE_DIVISIONS_ARRAY: string[] = ["I1", "I2", "I3"];

    public static readonly LOCK_AND_REEL_BONUS_GAME_SYMBOL: string = "T";

    // private _orientationSwap: OrientationSwap = new OrientationSwap();

    // Timeline for Reveal All/Auto Play
    private _revealAllTimeline: TimelineMax | undefined;

    //Used to represent the chest intant win
    private _chest!: Chest;

    // Check to prevent handleCheckWin being called twice
    private _pendingMatchesProcessed: any = undefined;

    // Keep track of pending matches
    private _pendingMatches: GameSymbolCard[] = [];

    private _gameComplete: boolean = false;

    private _handleCheckWinPromise: any = undefined;

    private _handleCheckWinResolve: any = undefined;

    private _completeBonusGame: any = undefined;

    private _itemsRevealed: number = 0;

    private _columns: number;

    private _mainGridElements: number;

    private _rows: number;

    private _baseGameLogo!: Container; //TODO: might need to add _ before the variable name

    private _baseGamePaytable!: Container; //TODO: might need to add _ before the variable name

    private _initialWinningSymbolsSelection!: Container; //TODO: might need to add _ before the variable name

    //TODO: will need to get rid of the below three variables to just 1 or 2 of them, the main usage of all of them is to prevent process pending wins multiple times and reveall all starts multiple times
    private _isInPendingMatchesProcess: boolean = false;

    private _isStillProcessingPendingWins: boolean = false;

    private _processPendingWinResolveFuc;

    private _baseConfigData;

    private _transitionBGAnimation!: TransitionBGAnimation;

    public constructor(
        parentProps: IWProps,
        parentActions: ControlActions,
        assetsIds: string[],
        layoutId: string,
        settings: ISubGameSettings,
    ) {
        // Pass the ExtendedWinningNumber and ExtendedPlayerNumber classes in the constructor
        super(parentProps, parentActions, assetsIds, layoutId, settings, ExtendedGameSymbolCard);
        this._columns = 5;
        this._rows = 3;
        this._mainGridElements = 15;
        // And the wheel fly out symbol
        this._chest = new Chest("chest");
        this._isStillProcessingPendingWins = false;
        this._isInPendingMatchesProcess = false;
    }

    /**
     * init
     */
    protected async init(): Promise<void> {
        super.init();
        // Grab the external gameConfig if there are any
        this._baseConfigData = this.assets.get(SymbolsCollectionSubGame.scConfigName).BaseConfig;
        if (this._baseConfigData) {
            if (this._baseConfigData.MainGridElements !== undefined) {
                this._mainGridElements = this._baseConfigData.MainGridElements;
            }
            if (this._baseConfigData.Rows !== undefined) {
                this._rows = this._baseConfigData.Rows;
            }
            if (this._baseConfigData.Columns !== undefined) {
                this._columns = this._baseConfigData.Columns;
            }
        }
        const transitionBGAnim = this.container.parent.parent.children.find(
            (obj) => obj.name === "waveTransitionAnim",
        ) as SpineAnimation;

        //TODO: put transition bg animation to use
        const transitionBGAnimPrt = this.container.parent.parent.children.find(
            (obj) => obj.name === "waveTransitionAnim_prt",
        ) as SpineAnimation;

        this._transitionBGAnimation = new TransitionBGAnimation(this, transitionBGAnim, transitionBGAnimPrt);

        this._baseGameLogo = this.container.parent.children.find((obj) => obj.name === "logo") as Container;

        this._initialWinningSymbolsSelection = this.container.parent.children.find(
            (obj) => obj.name === "initialWinningSymbolsSelection",
        ) as Container;

        this._baseGamePaytable = this.container.parent.children.find((obj) => obj.name === "paytable") as Container;

        gameStore.actions.revealActions.initGameSymbolsData(
            ...this.gameSymbolCards.gameSymbolCards.map((c, index) => {
                return { revealed: false, symbol: "", lastRevealed: false, isBonus: false, bonusComplete: false };
            }),
        );

        // Handle orientation change
        this.orientationChanged();

        // Handle base game visible
        this.handleBaseGameVisible();
    }

    /**
     * handleBaseGameVisible
     * A reaction used to hide the visual of this subGame, due to bonus game looks complete different to this base game
     */
    private handleBaseGameVisible(): void {
        // Add a mobx reaction for baseGameVisible, that way we can show and hide this component when needed
        // For example when a bonus is fully rendered
        MobxUtils.getInstance().addReaction(
            SymbolsCollectionSubGame.baseGameVisible,
            (): boolean => gameStore.props.baseGameVisible,
            (visible: boolean) => {
                this.showBaseGameAssets(visible);
            },
            { fireImmediately: false },
        );
    }

    private showBaseGameAssets(visible: boolean) {
        // this.show(visible);
        this.container.renderable = visible;
        this.container.visible = visible;
        this._baseGameLogo.renderable = visible;
        this._baseGameLogo.visible = visible;
        this._baseGamePaytable.renderable = visible;
        this._baseGamePaytable.visible = visible;
        this._initialWinningSymbolsSelection.renderable = visible;
        this._initialWinningSymbolsSelection.visible = visible;
    }

    /**
     * handleAllNumberCardsRevealed
     * this is the place where all symbol cards were revealed
     * @override
     */
    protected handleAllGameSymbolCardsRevealed(): void {
        this._gameComplete = true;
        // Check to see if we can process pending wins
        this.processPendingWins();
    }

    /**
     * setSubGameRevealed
     */
    private setSubGameRevealed(): void {
        this._gameComplete = false;
        this.sgActions.setRevealed(true);
        iwActions.controlActions.setRdsDirty(true);
        this._parent.actions.setSubGameRevealed(this);
        if (iwProps.revealAllState === RevealAllState.REVEAL_ALL_ENABLED) {
            this.handleRevealAllStop();
        }
    }

    /**
     * initWagerData
     * Allows a game in progress to resume from where the player left off
     * Here is where we parse the wager data
     */
    protected initWagerData(): void {
        //Bijian's note, This will  gets called in two cases, first one is after player has bought the ticket,
        //Another case is that when player left and come back from it (for example, by re-entering the website after closing the game off)
        // Check for any saved data, if there are any saved one on wds, otherwise we use an empty one
        const gameSymbolsData = iwProps.wagerDataSave.gameSymbolsData || [];
        const totalWinningSymbolsCount = iwProps.wagerDataSave.totalWinningSymbolsCount || 0;
        gameStore.actions.revealActions.increaseTotalWinningSymbolsCountByAmount(totalWinningSymbolsCount);
        gameSymbolsData.forEach((symbol, index) => {
            gameStore.actions.revealActions.setGameSymbolDataAndSaveToWagerDataSave({
                index, //index used to find the game symbol card by index
                revealed: symbol.revealed,
                symbol: symbol.symbol,
                lastRevealed: false,
                isBonus: symbol.isBonus,
                bonusComplete: symbol.bonusComplete,
            });
        });
    }

    /**
     * checkGameSymbolCardRevealed
     * This is so a dev can specify their own condition to work out if a number has been revealed as part of a game in progress
     * Called to check if this game symbols has been previously revealed befor eplayer left the game, if not add this to the Promises.list to resolve in handlePlay
     * @override
     * @returns boolean
     */
    protected checkGameSymbolCardRevealed(card: any): boolean {
        // Very straightforward, look at gameStore.props.gameInProgress and the value from the local reveal data, the gameSymbolCards.gameSymbolCards is same as gameStore.props.gameSymbolsData
        const gamesymbolCardData = gameStore.props.gameSymbolsData[this.gameSymbolCards.gameSymbolCards.indexOf(card)];
        // It is possible (albeit unlikely) to effectively have a complete ticket revealed but still
        // get a Game In Progress, if refresh is hit after the final RDS call, but before the complete wager call
        // Therefore, check data.lastRevealed, if this was the last card to be revealed, do not restore it
        // Same applies if we have a revealed-but-incomplete bonus, which can happen if we have used REVEAL ALL but refreshed
        // before the bonus was complete
        return (
            gameStore.props.gameInProgress &&
            gamesymbolCardData.revealed &&
            !gamesymbolCardData.lastRevealed &&
            !(gamesymbolCardData.isBonus && !gamesymbolCardData.bonusComplete)
        );
    }

    /**
     * handleGameSymbolCardRestore
     * Add logic to 'quick reveal' a game symbol using data from reveal data etc
     * this method will gets called when this card is indeed been revealed before player left
     * @override restore game in progress
     * @param symbolCard
     */
    protected handleGameSymbolCardRestore(symbolCard: SymbolCard): void {
        //get the right game symbol card data by its index
        const gameSymbolCardData: IGameSymbolData =
            gameStore.props.gameSymbolsData[this.gameSymbolCards.gameSymbolCards.indexOf(symbolCard)];

        // We need to remove this game symbol from the pool of gameSymbolsData
        const newGameSymbolCards: any[] = this.scProps.gameSymbols.slice();
        // Card already revealed (Game In Progress)
        const indexNum: number = newGameSymbolCards.findIndex((n) => n === gameSymbolCardData.symbol);
        // Remove from newPlayerNums since it has been revealed
        newGameSymbolCards.splice(indexNum, 1);
        // Now call initWinningNumbers with the new data, so exclude the revealed card
        this.scActions.initGameSymbols(newGameSymbolCards);
        symbolCard.enable(); //Enabled the button
        symbolCard.quickReveal(gameSymbolCardData);
        symbolCard.quickRevealSpine();
        // We need to see if this symbol card matches the selected winning symbols
        // And also check whether it matches any special cases e.g. a 2x
        if (symbolCard.isWinningSymbol()) {
            //This is a winning symbol,
            symbolCard.match();
        } else if (symbolCard.isInstantWin()) {
            //TODO: will need to make sure the the instant win amount is shown on the grid space
            // Handle bonus restore, we'll need to play the relevant spine animations
            symbolCard.match();

            //find what the current symbol index is sit in INSTANT_WIN_SYMBOLS_ARRAY
            const index = SymbolsCollectionSubGame.INSTANT_WIN_SYMBOLS_ARRAY.indexOf(symbolCard.symbol);
            //plug the found index into INSTANT_WIN_PRIZE_DIVISIONS_ARRAY to find the winning division string
            const winAmount = iwProps.prizeTable.get(
                SymbolsCollectionSubGame.INSTANT_WIN_PRIZE_DIVISIONS_ARRAY[index],
            ) as number;
            gameStore.actions.revealActions.addWin(winAmount);
        } else if (symbolCard.isLockAndReelBonusGame()) {
            symbolCard.match();
            gameStore.actions.revealActions.addWin(gameStore.props.lockAndReelBonusGamePrize);
        }

        // Call checkLastItemRevealed to increase the counter
        this.checkLastItemRevealed();
    }

    /**
     * handlePopulate
     * The place that game scenario got send back from server after player successfully bought the ticket
     */
    public async handlePopulate(): Promise<void> {
        // Here we can check whether we actually need this subGame at all
        // For this, we need to look at gameStore.props.lockAndReelBonusGameData
        //This promise is used in handleCheckWin
        this._handleCheckWinPromise = new Promise((winResolve, reject) => {
            this._handleCheckWinResolve = winResolve;
        });

        return new Promise((resolve) => {
            // Init the sc prop store with the local game symbol cards
            this.scActions.initGameSymbols(gameStore.props.gameSymbols);
            // Enable, this will trigger check for restore data if player left unfinished game
            this.enable();
            // Set all numbers to their enabled, but STATIC state
            this.setSymbolCardsStatic();
            // Start idle
            this.sgActions.startIdle();
            // Resolve
            resolve();
        });
    }

    /**
     * setNumbersStatic
     */
    private setSymbolCardsStatic(): void {
        this.gameSymbolCards.gameSymbolCards.forEach((symbolCard: GameSymbolCard) => {
            symbolCard.setStatic();
        });
    }

    /**
     * handleReset
     */
    public async handleReset(): Promise<void> {
        // Reset wager data
        gameStore.actions.revealActions.resetWagerData();
        // SubGame reset
        super.handleReset();

        // Number of items revealed 0
        this._itemsRevealed = 0;
        // Last item no longer revealed
        gameStore.actions.revealActions.setLastItemRevealed(false);
        this._handleCheckWinPromise = undefined;
        this._handleCheckWinResolve = undefined;
        // Bonus game no longer revealed
        gameStore.actions.revealActions.setBonusGameRevealed(false);
    }

    /**
     * gameSymbolCardRevealing
     * Called when a player number is revealing, and we need to play reveal sound for example
     * @override
     */
    protected gameSymbolCardRevealing(symbolCard: GameSymbolCard): void {
        // Play a sound
        if (gameStore.props.revealAllEnabled === false) {
            this.playRandomRevealSound();
        }

        // Check if last item revealed
        this.checkLastItemRevealed();

        // If we are revealing a 'special' symbol, for example an instant win or bonus reel game
        // We should prevent any further interaction, as otherwise we could end up with plaques rendering over plaques etc
        // Only in manual play though
        if (iwProps.revealAllState !== RevealAllState.REVEAL_ALL_ENABLED) {
            // Right, we need to work out whether this number is a special case
            // and disable interaction if it is
            if (symbolCard.isInstantWinOrLockAndReelBonusWin()) {
                this.toggleInteraction(false);
            }
        }
    }

    /**
     * checkGameSymbolCardWin
     * @override
     */
    protected async checkGameSymbolCardWin(symbolCard: SymbolCard): Promise<void> {
        // We do not need to check for any winning if this auto revealling.
        // If we are in auto play, win presentation is dealt with at the end
        // So ignore it for now, it'll be marked off later
        // If we are in Reveal All, don't mark off, the process pending matches will deal with it
        if (iwProps.revealAllState === RevealAllState.REVEAL_ALL_ENABLED) return;
        if (this._isStillProcessingPendingWins) return;
        // For any cards that are revealed, but not matched
        if (symbolCard.getRevelead() && !symbolCard.matched) {
            if (symbolCard.isInstantWin()) {
                symbolCard.match();
                const index = SymbolsCollectionSubGame.INSTANT_WIN_SYMBOLS_ARRAY.indexOf(symbolCard.symbol);
                //plug the found index into INSTANT_WIN_PRIZE_DIVISIONS_ARRAY to find the winning division string
                const winAmount = iwProps.prizeTable.get(
                    SymbolsCollectionSubGame.INSTANT_WIN_PRIZE_DIVISIONS_ARRAY[index],
                ) as number;

                // Present win
                await symbolCard.presentWin();
                symbolCard.setMatchAnimRenderable(false);
                // Present Chest opening
                await this._chest.presentWin(winAmount, symbolCard);
                symbolCard.setMatchAnimRenderable(true);
                symbolCard.afterPresentWin(winAmount);

                // Re-enable interaction
                this.toggleInteraction(true);
                // Add to win
                gameStore.actions.revealActions.addWin(winAmount);
            } else if (symbolCard.isLockAndReelBonusGame()) {
                symbolCard.match();
                // It's a bonus game
                this.setButtonsStates(false);
                // Present win first
                await symbolCard.presentWin(false, false);
                await symbolCard.playBonusWinAnimation(this._baseConfigData.NumberOfGlassShakesBeforeTransition);
                await this._transitionBGAnimation.playTransitionBG(true); //Wave transition
                this.bonusGameTriggered();

                await this.bonusGameComplete();

                await this._transitionBGAnimation.playTransitionBG(false); //Wave transition

                this.gameSymbolCardRevealed(symbolCard);

                // Re-enable interaction
                this.toggleInteraction(true);
            } else if (symbolCard.isWinningSymbol()) {
                //Now this game symbol matches the selected winning SYMBOL
                symbolCard.match();
                // Regular Match, play the sound
                soundManager.execute(`onSymbolMatch${symbolCard.symbol}`);
                // Present win
                await symbolCard.presentWin();
                // Add to win
                //TODO: calculate win value differently then just add Win, because win is presented at the end,
                //we do not need to add any win values at moment, because only when game ends, will the main game data's win be added and win be presented
                const symbolsCount = parseInt(symbolCard.symbol, 10);
                gameStore.actions.revealActions.increaseTotalWinningSymbolsCountByAmount(symbolsCount);
            }
        }
    }

    /**
     * bonusGameTriggered
     */
    private bonusGameTriggered(): void {
        // Right, we have triggered a bonus game
        // Firstly, deactivate Reveal All
        // This will stop/cancel/kill the auto reveal TweenMaxTimeline, if we do not do this, the game symbol cards will keep revealling while switch to bonus game and play the bonus game
        if (iwProps.revealAllState === RevealAllState.REVEAL_ALL_ENABLED) {
            if (gameStore.props.lastItemRevealed === false) {
                iwActions.controlActions.setRevealAllState(RevealAllState.REVEAL_ALL_DISABLED);
            } else {
                this.handleRevealAllStop(); //TODO: might not need to do this, let's see if it causes issue
            }
        }

        // Activate subGame
        iwActions.controlActions.setActiveGame(GameIDs.LOCK_AND_HOLD_BONUS);
    }

    public setButtonsStates(state: boolean, transitionIn: boolean = true) {
        // Disable help/paytable controls for transition
        if (transitionIn === true) {
            gameStore.actions.revealActions.setSettingsButtonEnabled(state);
        }

        // We absolutely do not want to mark this SubGame as complete
        // We just want to set the next SubGame as active
        // Set the Lock and Reel bonus game as triggered
        gameStore.actions.revealActions.setBonusGameTriggered(!state);
    }

    public async handleExit(): Promise<void> {
        super.handleExit();
    }

    /**
     * bonusGameComplete
     * @param bonusGame
     */
    private async bonusGameComplete(): Promise<void> {
        // Await new Promise
        await new Promise((resolve) => {
            this._completeBonusGame = resolve;
        });

        // Set bonusGameComplete, so if we have a GIP the bonus can be marked off
        gameStore.actions.revealActions.setBonusGameRevealed(true);

        // _completeBonusGame now undefined
        this._completeBonusGame = undefined;
    }

    /**
     * checkGameSymbolCardMatch
     * A game symbol has been revealed, we need to compare it to WINNING symbols and see if there has been a match
     * @override
     * @param gameSymbol
     */
    protected checkGameSymbolCardMatch(gameSymbol: GameSymbolCard, isRevealAll?: boolean): void {
        // Only mark off a match if we're in manual play
        if (iwProps.revealAllState === RevealAllState.REVEAL_ALL_ENABLED && !isRevealAll) return;
        // TODO: might not need this, since checkGameSymbolCardWin() does all of this already. /IAM HERE
        if (gameSymbol.isWinningSymbol()) {
            // Match
            gameSymbol.match();
            // Present win
            gameSymbol.presentWin();
            // Play a sound
            soundManager.execute(`onSymbolMatch${gameSymbol.symbol}`);
        }
    }

    /**
     * gameSymbolCardRevealed
     * Called when a player number has been completely revealed and win processing done
     * This is, for example, so we can use RevealDataSave/WagerDataSave
     * Called last at enableGameSymbolCards run-through methods to denote "Done"
     * @override
     */
    protected gameSymbolCardRevealed(symbolCard: GameSymbolCard): void {
        // Now store using RDS
        // We never want to save an unrevealed bonus as complete
        // So set isBonus and bonusGameRevealed
        gameStore.actions.revealActions.setGameSymbolDataAndSaveToWagerDataSave({
            index: this.gameSymbolCards.gameSymbolCards.indexOf(symbolCard),
            revealed: symbolCard.getRevelead(),
            symbol: symbolCard.symbol,
            lastRevealed: this.promises.length === 1,
            isBonus: symbolCard.isLockAndReelBonusGame(), // Store whether this is a seperate stage bonus
            bonusComplete: gameStore.props.bonusGameRevealed, // Store bonusGameRevealed
        });
    }

    /**
     * handleEntry
     */
    public async handleEntry(): Promise<void> {
        super.handleEntry();
        //Bijian's note, if bonus game is in progress, after SetSubGameActive(0), ths handEntry will gets called, thus unPause the Async Await,
        //Because if _complteBonusGame is not get called to resolve, game will looks being paused.
        // Right, let's see if we need to resume from a bonus game
        // Check to see if '_completeBonusGame' is defined
        if (this._completeBonusGame) {
            this._completeBonusGame();
        }
    }

    /**
     * handleCheckWin
     * Game Symbols win handling will be almost entirely game specific, since there are many different ways of winning
     * It is appropriate for the dev to have full control over this
     * This is called when a handlePlay promise got resolved, handle check win got called afterwards
     * @override
     */
    public async handleCheckWin(): Promise<void> {
        // So, let's work out what we need to return
        // If we have turns remaining, just return Promise.resolve()
        // If this is the last turn, hold off for this._handleCheckWinPromise to be resolved
        if (!gameStore.props.lastItemRevealed) {
            return Promise.resolve();
        }

        return this._handleCheckWinPromise;
    }

    /**
     * processPendingWins
     * This will be called when the last item has been revealed, but *just* before the
     * last promise has been resolved. Therefore we are safe to run the win processing here if promises.length === 1
     */
    private async processPendingWins(): Promise<void> {
        if (this._isInPendingMatchesProcess) return;
        this._isInPendingMatchesProcess = true;
        // We can now handle all win processing
        // await this.processPendingWinningMatches(); TODO: we do not have Winning Matches concept in this game, but game symbols(player numbers) match to predefined symbol
        // Now check for pending player matches
        await this.processPendingSymbolMatches();
        // Check for a pending WIN ALL
        // await this.winAllPresentationComplete();
        this._handleCheckWinResolve();
        // If we have finished the game, mark the subGame as revealed
        // Sub Game revealed if game complete
        if (this._gameComplete) {
            this.setSubGameRevealed();
        }
    }

    private async waitForProcessingToFinish(): Promise<void> {
        await new Promise<void>((resolve) => {
            if (this._isStillProcessingPendingWins === true) {
                this._processPendingWinResolveFuc = resolve;
            } else {
                resolve();
            }
        });
        this._processPendingWinResolveFuc = undefined;
    }

    /**
     * Start Reveal All
     * @override
     * @returns Timeline
     * Function public so we can extend and customise Reveal All behaviour
     */
    public async handleRevealAllStart(): Promise<void> {
        const next = SubGame.getNext();
        if (next && next !== this) return; //Return here if the current active game is not this one
        if (this._processPendingWinResolveFuc) return;
        await this.waitForProcessingToFinish();
        if (gameStore.props.revealAllEnabled === false) return;
        this._isStillProcessingPendingWins = true;
        // Disable all interaction
        this.toggleInteraction(false, true);
        // Grab the game config
        const revealAllConfig = this.assets.get(SymbolsCollectionComponent.gameConfigName).RevealAll.BaseGame;
        // const gameConfig = this.assets.get(SymbolsCollectionComponent.configName).GameConfig;
        //Find out which game symbol card is unrevealed, and add it to unrevealedPicks List
        const unrevealedGameSymbols: any[] = [];

        for (let i = 0; i < this.gameSymbolCards.gameSymbolCards.length; i++) {
            //Starts from 1 to 15, not from 0 to 14
            if (!this.gameSymbolCards.gameSymbolCards[i].getRevelead()) {
                unrevealedGameSymbols.push(this.gameSymbolCards.gameSymbolCards[i]);
            }
        }

        //create a Delayed call sequence tweens from unrevealedPicks list gathered above
        const revealArray: any[] = unrevealedGameSymbols.map((element, number) =>
            TweenMax.delayedCall(0, () => {
                unrevealedGameSymbols[number].reveal();
            }),
        );
        // Store rows in use, we'll need this to work out which numbers to apply the row delay to
        const rowsGotUnrevealedElements: boolean[] = [false, false, false];
        for (let i: number = 0; i < this.gameSymbolCards.gameSymbolCards.length; i++) {
            // Find the row that this number is on
            const row: number = Math.floor((this.gameSymbolCards.gameSymbolCards[i].id - 1) / this._columns); //e.g. 0 / 5 = 0, 14 / 5 = 2
            if (this.gameSymbolCards.gameSymbolCards[i].getRevelead() === false) {
                rowsGotUnrevealedElements[row] = true;
            }
        }

        const playRevealSoundArray: TweenMax[] = [
            TweenMax.delayedCall(0, () => {
                this.playRandomRevealSound();
            }),
        ];
        let secondRowAssigned = false;
        let thirRowAssigned = false;

        let delay: number = 0;
        for (let i: number = 0; i < revealArray.length; i++) {
            if (revealAllConfig.revealOneByOne) {
                // We only need to add a delay to this column if the previous column has unrevealed items
                delay += revealAllConfig.autoPlayGameSymbolRevealInterval;
                revealArray[i].delay(delay);
            } else {
                // Find the row that this number is on
                const row: number = Math.floor((unrevealedGameSymbols[i].id - 1) / this._columns); //e.g. 0 / 5 = 0, 14 / 5 = 2
                if (row === 1) {
                    if (rowsGotUnrevealedElements[0] === false) {
                        delay = 0 * revealAllConfig.autoPlaySymbolsRowInterval;
                    } else {
                        delay = 1 * revealAllConfig.autoPlaySymbolsRowInterval;
                        if (secondRowAssigned === false) {
                            secondRowAssigned = true;
                            playRevealSoundArray.push(
                                TweenMax.delayedCall(1 * revealAllConfig.autoPlaySymbolsRowInterval, () => {
                                    this.playRandomRevealSound();
                                }),
                            );
                        }
                    }
                } else if (row === 2) {
                    if (rowsGotUnrevealedElements[0] === false && rowsGotUnrevealedElements[1] === false) {
                        delay = 0 * revealAllConfig.autoPlaySymbolsRowInterval;
                    } else if (rowsGotUnrevealedElements[0] === false && rowsGotUnrevealedElements[1] === true) {
                        delay = 1 * revealAllConfig.autoPlaySymbolsRowInterval;
                        if (secondRowAssigned === false) {
                            secondRowAssigned = true;
                            playRevealSoundArray.push(
                                TweenMax.delayedCall(1 * revealAllConfig.autoPlaySymbolsRowInterval, () => {
                                    this.playRandomRevealSound();
                                }),
                            );
                        }
                    } else if (rowsGotUnrevealedElements[0] === true && rowsGotUnrevealedElements[1] === true) {
                        delay = 2 * revealAllConfig.autoPlaySymbolsRowInterval;
                        if (thirRowAssigned === false) {
                            //TODO: might need to add check to see if secondRow has been assigned
                            thirRowAssigned = true;
                            playRevealSoundArray.push(
                                TweenMax.delayedCall(2 * revealAllConfig.autoPlaySymbolsRowInterval, () => {
                                    this.playRandomRevealSound();
                                }),
                            );
                        }
                    }
                }

                revealArray[i].delay(delay);
            }
        }

        // Instantiate the timeline
        this._revealAllTimeline = new TimelineMax();

        // Start with the winning numbers
        this._revealAllTimeline.add(new TimelineMax({ tweens: revealArray }));

        const revealAllTimeLine = new TimelineMax();
        revealAllTimeLine.add(new TimelineMax({ tweens: playRevealSoundArray }));
    }

    private playRandomRevealSound(): void {
        const ramNum = Math.floor(Math.random() * 3);
        if (ramNum === 0) {
            soundManager.execute("onTileReveal01");
        } else if (ramNum === 1) {
            soundManager.execute("onTileReveal02");
        } else {
            soundManager.execute("onTileReveal03");
        }
    }

    /**
     * Stop Reveal All
     */
    public async handleRevealAllStop(): Promise<void> {
        // kill the revealAll timeline if active
        if (this._revealAllTimeline) {
            this._revealAllTimeline.kill();
            this._revealAllTimeline = undefined;
            if (gameStore.props.lastItemRevealed === false) await this.processPendingWins();
        }

        if (this._processPendingWinResolveFuc === undefined) {
            this._isStillProcessingPendingWins = false;
        }

        if (gameStore.props.lastItemRevealed === false) {
            //Only togggle interaction on if lastItemRevealed is equal to false
            // Re-enable all interaction at the parent container level
            this.toggleInteraction(true);
        }
    }

    /**
     * handleIdleStart
     */
    protected handleIdleStart(): void {
        // We only want to be triggering the idle animations if all symbol cards are in a valid state
        let canTriggerIdle: boolean = true;

        // Search the game symbol cards
        this.gameSymbolCards.unrevealed.forEach((pn: any) => {
            if (!pn.canTriggerIdle() && canTriggerIdle) {
                canTriggerIdle = false;
            }
        });
        // Return if we cannot trigger idle
        if (
            !canTriggerIdle ||
            iwProps.revealAllState === RevealAllState.REVEAL_ALL_ENABLED ||
            this._completeBonusGame
        ) {
            this.sgActions.abortIdle();
            return;
        }
        // Start idle
        this.gameSymbolCards.unrevealed.forEach((pn: any) => pn.startIdle());
    }

    /**
     * handleIdleStop
     */
    protected handleIdleStop(): void {
        this.gameSymbolCards.unrevealed.forEach((pn: any) => pn.stopIdle());
    }

    /**
     * orientationChanged
     */
    private orientationChanged(): void {
        MobxUtils.getInstance().addReaction(
            SymbolsCollectionSubGame.orientationChangedReaction,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                this._transitionBGAnimation.setWaveTransitionVisibilties();
            },
        );
    }

    /**
     * processPendingSymbolMatches
     * @returns Promise<void>
     * Used to process anything that is not been marked in (reveal all/ auto play)
     */
    private async processPendingSymbolMatches(): Promise<void> {
        // Let's run through the game symbol cards
        // identify anything with a 'special' win - that is, instant win / lock and hold bonus game, that hasn't yet been marked as matched
        // Work out which matches qualify
        // Now search
        this.gameSymbolCards.gameSymbolCards.forEach((card) => {
            //Bijian's Note, if we do not mark a card as already been matched using match() in manually play, it will be processed in here again.
            if (!card.matched) {
                if (card.isSpecialCase()) {
                    this._pendingMatches.push(card);
                }
            }
        });

        this.makeBonusGameLastRevealedForPendingMatchWin();

        // Await new Promise
        await new Promise<void>(async (resolve) => {
            // If we have no matches, resolve
            if (this._pendingMatches.length > 0) {
                //Store the resolve, then resolve it when this._pendingMatches' array length is equal to 0
                this._pendingMatchesProcessed = resolve;
                // Now kick off processing the matches
                await this.processPendingMatch();
            } else {
                //no any pending winning matches, so we resolve here
                resolve();
                this.setPendingProcessToFinish();
            }
        });
    }

    private makeBonusGameLastRevealedForPendingMatchWin() {
        //No need to re-arrange the __pendingMatches array if it is only 1 or 0 items inside.
        if (this._pendingMatches.length < 2) return;

        const bonusGamePendingMatchIndex = this._pendingMatches.findIndex((bonusSymbol) =>
            bonusSymbol.isLockAndReelBonusGame(),
        );

        //There is no bonus game for this ticket
        if (bonusGamePendingMatchIndex === -1) return;

        const deletedBonusGameSymbol = this._pendingMatches.splice(bonusGamePendingMatchIndex, 1);
        this._pendingMatches.push(deletedBonusGameSymbol[0]);
    }

    private setPendingProcessToFinish() {
        this._isInPendingMatchesProcess = false;
        if (this._processPendingWinResolveFuc) {
            this._processPendingWinResolveFuc();
            this._isStillProcessingPendingWins = false;
        }
    }

    /**
     * processPendingMatch
     * @returns Promise<void>
     */
    private async processPendingMatch(): Promise<void> {
        // Grab the external GameOptions config
        const gameOptionsConfig = this.assets.get(SymbolsCollectionSubGame.gameConfigName).GameOptions;

        // Get next match
        const card: GameSymbolCard = this._pendingMatches.shift() as GameSymbolCard;
        this.checkGameSymbolCardMatch(card, true);
        // alert("process pending wins");
        // We have everything we need now
        await new Promise<void>(async (resolve) => {
            // If this is a WIN ALL, we don't need to show a plaque, only process the win, the plaque will be shown
            // as part of the overall WIN ALL logic
            // Mark as matched
            card.match();
            // Now process
            if (card.isWinningSymbol()) {
                //TODO: might need to move the card logic into card's class, so it is encapsulated
                await card.presentWin(true);
                const symbolsCount = parseInt(card.symbol, 10);
                //Find the symbols count and add it to total collected symbols count
                gameStore.actions.revealActions.increaseTotalWinningSymbolsCountByAmount(symbolsCount);
            } else if (card.isInstantWin()) {
                if (gameStore.props.lastItemRevealed === false) this.toggleInteraction(false);
                soundManager.execute("onBonusTileReveal"); //Might need to request different one when chest appearing.
                //find what the current symbol index is sit in INSTANT_WIN_SYMBOLS_ARRAY
                const index = SymbolsCollectionSubGame.INSTANT_WIN_SYMBOLS_ARRAY.indexOf(card.symbol);
                //plug the found index into INSTANT_WIN_PRIZE_DIVISIONS_ARRAY to find the winning division string
                const winAmount = iwProps.prizeTable.get(
                    SymbolsCollectionSubGame.INSTANT_WIN_PRIZE_DIVISIONS_ARRAY[index],
                ) as number;

                // Present win
                await card.presentWin(true, true);
                card.setMatchAnimRenderable(false);
                //Show the chest opening and fade away animation to show the winning amount
                await this._chest.presentWin(winAmount, card);
                card.setMatchAnimRenderable(true);
                card.afterPresentWin(winAmount);

                // Add to win
                gameStore.actions.revealActions.addWin(winAmount);
            } else if (card.isLockAndReelBonusGame()) {
                if (gameStore.props.lastItemRevealed === false) this.toggleInteraction(false);
                // Play a sound
                soundManager.execute("onBonusTileReveal2");
                // It's a bonus game
                // Present win first
                this.setButtonsStates(false);
                await card.presentWin(false, false);
                await card.playBonusWinAnimation(this._baseConfigData.NumberOfGlassShakesBeforeTransition);
                await this._transitionBGAnimation.playTransitionBG(true); //Wave transition effect
                this.bonusGameTriggered();
                // Wait for the bonus game to be completed
                await this.bonusGameComplete();

                await this._transitionBGAnimation.playTransitionBG(false); //Wave transition effect
            }

            // Now call playerNumberRevealed to mark this bonus as complete in the wagerData
            // TODO: might or might not need to do this, since gameSymbolCardRevealed is called at the last of revealling chain
            this.gameSymbolCardRevealed(card);
            // And resolve
            resolve();
        });

        // Win displayed, now we're looking to see if there are any more
        // If this is the last pending win, resolve the promise
        if (this._pendingMatches.length === 0) {
            this._pendingMatchesProcessed();
            this.setPendingProcessToFinish();
            if (gameStore.props.lastItemRevealed === false) this.toggleInteraction(true);
        } else {
            // do a TweenMax.delayedCall and kick off the next one
            TweenMax.delayedCall(gameOptionsConfig.revealAllProcessInterval, () => {
                this.processPendingMatch();
            });
        }
    }

    /**
     * toggleInteraction
     */
    private toggleInteraction(toggle: boolean, isManualReveal: boolean = false): void {
        // If stopping interaction, stop idle
        // Also disable settings, help and paytable buttons
        if (!toggle) {
            this.sgActions.stopIdle();
            gameStore.actions.revealActions.setSettingsButtonEnabled(toggle);
        } else {
            this.sgActions.resetIdle();
        }

        // Set interaction
        this.gameSymbolCards.container.interactiveChildren = toggle;

        // Do the same with the Reveal All button
        if (isManualReveal === false) {
            gameStore.actions.revealActions.toggleRevealAllControl(toggle);
        } else {
            gameStore.actions.revealActions.setLastItemRevealed(true);
        }
    }

    /**
     * checkLastItemRevealed
     */
    private checkLastItemRevealed(): void {
        // Increment _itemsRevealed
        this._itemsRevealed++;
        // Calculate total
        const total: number = this.gameSymbolCards.gameSymbolCards.length;
        // Check against total, if we have revealed all winningNumbers and playerNumbers, set setLastItemRevealed to true
        if (this._itemsRevealed === total) {
            // Last item revealed
            gameStore.actions.revealActions.setLastItemRevealed(true);
        }
    }

    /**
     * clearTurnData
     */
    public clearTurnData(): void {
        gameStore.actions.revealActions.resetTurnData();
    }
}
