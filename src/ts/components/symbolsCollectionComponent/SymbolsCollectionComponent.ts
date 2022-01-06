import { ControlActions, ISubGameSettings, iwActions, iwProps, IWProps, SubGame } from "playa-iw";
import { gameStore } from "..";
import { GameSymbolCard } from "./components/GameSymbolCard";
import { GameSymbolCards } from "./components/GameSymbolCards";
import { SymbolsCollectionActions } from "./SymbolsCollectionActions";
import { SymbolsCollectionData } from "./SymbolsCollectionData";
import { SymbolsCollectionProps } from "./SymbolsCollectionProps";

/**
 * SymbolsCollectionComponent
 */
export class SymbolsCollectionComponent extends SubGame {
    // Grab the config
    public static readonly gameConfigName: string = "gameConfig.json";

    // Key Number Match specific config
    public static readonly scConfigName: string = "symbolsCollectionConfig.json";

    private _scData: SymbolsCollectionData;

    public scActions: SymbolsCollectionActions;

    public scProps: SymbolsCollectionProps;

    public gameSymbolCards: GameSymbolCards;

    // Store promises for any unrevealed game symbols
    public promises: Promise<void>[] = [];

    // Constructor
    public constructor(
        parentProps: IWProps,
        parentActions: ControlActions,
        assetsIds: string[],
        layoutId: string,
        settings: ISubGameSettings,
        ExtendedGameSymbolCard?: any,
        gameSymbolsLayoutId?: string,
    ) {
        super(parentProps, parentActions, assetsIds, layoutId, settings);

        // Init data
        this._scData = new SymbolsCollectionData();
        // Init actions
        this.scActions = new SymbolsCollectionActions(this._scData);
        // Init props
        this.scProps = new SymbolsCollectionProps(this._scData, iwProps);

        // And finally create instances of game symbol cards
        // Pass either the extended GameSymbolCard classes, or regular GameSymbolCard if undefined
        this.gameSymbolCards = new GameSymbolCards(
            ExtendedGameSymbolCard !== undefined ? ExtendedGameSymbolCard : GameSymbolCard,
            this.scActions,
            this.scProps,
            this.sgActions,
            [GameSymbolCards.scConfigName],
            gameSymbolsLayoutId,
        );
    }

    /**
     * Init
     */
    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build the layout
        this.build();

        // Init SubGame reactions
        this.initReactions();
    }

    /**
     * Enable
     * This called in handlePopulate, this is called in an awaited manner
     */
    public async enable(): Promise<void> {
        // Init wager data
        this.initWagerData();

        // Init the _promises array, concat the symbol cards
        this.promises = this.enableGameSymbolCards();

        // Track unresolved promises
        //only the last one got resolved, will this await got finish
        await this.gameSymbolCardsRevealed();

        // Handler for when all number cards revealed
        this.handleAllGameSymbolCardsRevealed();
    }

    /**
     * gameSymbolCardsRevealed
     */
    protected async gameSymbolCardsRevealed(): Promise<void> {
        await new Promise<void>((resolve) => {
            this.promises.forEach(async (p) => {
                try {
                    await p;
                } catch (e) {
                    console.error(e);
                }

                // Single number revealed
                this.promises.splice(this.promises.indexOf(p), 1);

                // Set RDS dirty
                iwActions.controlActions.setRdsDirty(true);

                // Check complete
                if (this.promises.length === 0) {
                    // Game complete if promises array is equal to 0, means all numbers were resolved
                    resolve();
                }
            });
        });
    }

    /**
     * handleAllGameSymbolCardsRevealed
     * set this subGaem as revealed and notify the server about it by setting eds to dirty
     */
    protected handleAllGameSymbolCardsRevealed(): void {
        // alert("game ended because all game symbol cards were revealed");
        this.sgActions.setRevealed(true);
        iwActions.controlActions.setRdsDirty(true);
        this._parent.actions.setSubGameRevealed(this);
    }

    /**
     * initWagerData
     * Allows a game in progress to resume from where the player left off
     */
    protected initWagerData(): void {}

    /**
     * enableGameSymbolCards
     * this method creates an array of Promises, if card is already revealed, it will create a already resolved promise, otherwise a new Promise gets created and insert into the Promise Array
     * @returns Promise<void>[]
     */
    protected enableGameSymbolCards(): Promise<void>[] {
        // Return an array of promises for each card's lifecycle
        return this.gameSymbolCards.gameSymbolCards.map(async (card, index) => {
            if (this.checkGameSymbolCardRevealed(card)) {
                // This number has been revealed, restore it using local store (extended protected function)
                this.handleGameSymbolCardRestore(card);
            } else {
                // Enable the card and wait for it to be revealed (manually or automatically), will be unblocked if reveal() resolve being called by auto-revealing or manually click through button-up
                await card.enable();
                // Populate the card with the Game Symbol in the mainGaemGridData, ready to be uncovered
                // alert("card populate with symbol " + gameStore.props.mainGameGridData[index]);
                card.populate(gameStore.props.mainGameGridData[index]); //Init each game symbols card with its index
                // Player number is revealing
                this.gameSymbolCardRevealing(card);
                // Wait for the uncover animation (if animated)
                await card.uncover();
                // Await any custom behaviour
                await card.customBehaviour();
                // Now check for a win
                await this.checkGameSymbolCardWin(card);
                // Check to see if this game symbol is a winning symbol
                this.checkGameSymbolCardMatch(card);
                // Handle game symbol revealed, so RDS can be implemented on the game side
                this.gameSymbolCardRevealed(card);
            }
        });
    }

    /**
     * checkGameSymbolCardRevealed
     * This is so a dev can specify their own condition to work out if a number has been revealed as part of a game in progress
     * @param card
     * @returns boolean
     */
    protected checkGameSymbolCardRevealed(card: any): boolean {
        return false;
    }

    /**
     * handleGameSymbolCardRestore
     * Add logic to 'quick reveal' a player number using data from reveal data etc
     * @param card
     */
    protected handleGameSymbolCardRestore(card: any): void {}

    /**
     * gameSymbolCardRevealing
     * Called when a player number is revealing, as we may need to add behaviour over and above simply playing an animation
     * For example playing a sound, or triggering an animation elsewhere in the game, a coin shower etc
     * @param card
     */
    protected gameSymbolCardRevealing(card: any): void {}

    /**
     * checkGameSymbolCardWin
     * Check to see if THIS particular player number is a match for any previously revealed winning numbers
     * If we find any matching winning numbers, we should set this particular player number to matched
     * @param card
     * @returns Promise<void>
     */
    protected async checkGameSymbolCardWin(card: any): Promise<void> {}

    /**
     * gameSymbolCardRevealed
     * A player number has finished revealing, we may need to add behaviour that reacts to this, such as saving reveal/wager data
     * @param card
     */
    protected gameSymbolCardRevealed(card: any): void {}

    /**
     * checkGameSymbolCardMatch
     * A player number has been revealed, we need to run through the revealed WINNING numbers and see if there has been a match
     * If we find any matching player numbers, we need to mark those as matched
     * @param card
     */
    protected checkGameSymbolCardMatch(card: any): void {}

    /**
     * Reset
     */
    public reset(): void {}

    /******************************
     * Subgame overrides
     ******************************/
    /**
     * handlePlay
     * This is effectively a 'state change', when a KNM promise is resolved (i.e. a number card has been revealed)
     * this will return said promise, or resolve completely. This will then run through the IXF states to save wager data
     * On state change complete (onResolveStage), handleCheckWin will be called
     */
    public async handlePlay(): Promise<void> {
        // Either return the next promise or resolve
        return this.promises.length > 0 ? Promise.race(this.promises) : Promise.resolve();
    }

    /**
     * handlePopulate
     * This is exclusively dealt with by the extended component
     */
    public async handlePopulate(): Promise<void> {}

    /**
     * handleCheckWin
     * KNM win handling will be almost entirely game specific, since there are many different ways of winning
     * It is appropriate for the dev to have full control over this. It is USUALLY called after every state change.
     */
    public async handleCheckWin(): Promise<void> {}

    /**
     * handleEntry
     */
    public async handleEntry(): Promise<void> {
        super.handleEntry();
    }

    /**
     * handleExit
     */
    public async handleExit(): Promise<void> {
        this.sgActions.setActive(false);
    }

    /**
     * Reset
     */
    public async handleReset(): Promise<void> {
        this.gameSymbolCards.reset();
        super.handleReset();
    }

    /**
     * Start Reveal All
     * Function public so we can extend and customise Reveal All behaviour
     * We may also wish to call this from outside, hence public
     */
    public async handleRevealAllStart(): Promise<void> {}

    /**
     * Stop Reveal All
     * Function public so we can extend and customise Reveal All (Stop) behaviour
     * We may also wish to call this from outside, hence public
     */
    public async handleRevealAllStop(): Promise<void> {}

    /**
     * handleIdleStart
     * Protected function to start all idle animations of currently unrevealed Player numbers
     * This will require logic implementing on the extended side
     * You should use the SubGame Actions startIdle, stopIdle, resetIdle, abortIdle and idleOff
     * Avoid setting the IdleState directly
     */
    protected handleIdleStart(): void {}

    /**
     * stopIdle
     * Protected function to stop all idle animations of currently unrevealed Player numbers
     */
    protected handleIdleStop(): void {}
}
