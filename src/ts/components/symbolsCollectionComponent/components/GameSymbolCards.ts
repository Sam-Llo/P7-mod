import { BaseView, ParentDef } from "playa-core";
import { SubGameActions } from "playa-iw";
import { SymbolsCollectionActions } from "../SymbolsCollectionActions";
import { SymbolsCollectionProps } from "../SymbolsCollectionProps";
import { GameSymbolCard } from "./GameSymbolCard";

/**
 * GameSymbolCards
 */
export class GameSymbolCards extends BaseView<any, null, any, null> {
    // Symbols Collection Match specific config
    public static readonly scConfigName: string = "symbolsCollectionConfig.json";

    public GameSymbolClass: any;

    public gameSymbolCards: GameSymbolCard[];

    private _numberCardMap: Map<string, GameSymbolCard>;

    private _parentActions: SymbolsCollectionActions;

    private _parentProps: SymbolsCollectionProps;

    private _sgActions: SubGameActions;

    // Constructor
    public constructor(
        GameSymbolClass: any,
        parentActions: SymbolsCollectionActions,
        parentProps: SymbolsCollectionProps,
        subGameActions: SubGameActions,
        assetIds: string[],
        layoutId: string = "gameSymbols",
    ) {
        super(new ParentDef(null, null), {}, undefined, assetIds, layoutId);
        //Init right game symbol card class to be used for the game
        this.GameSymbolClass = GameSymbolClass;
        this._parentActions = parentActions;
        this._parentProps = parentProps;
        this._sgActions = subGameActions;

        // Init numberCards array
        this.gameSymbolCards = [];
        // Init map
        this._numberCardMap = new Map();
    }

    /**
     * init
     */
    protected async init(): Promise<void> {
        // Grab the external config
        const scConfig = this.assets.get(GameSymbolCards.scConfigName);
        const gameSymbolsConfig = scConfig.GameSymbols;

        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Run through the layout map and identify any game symbols
        if (this.layout.type === "group") {
            this._numberCardMap = new Map(
                this.layout.children
                    .filter(
                        (child): boolean =>
                            child.id.startsWith(gameSymbolsConfig.InstancePrefix) && this.containsNumber(child.id),
                    )
                    .map((child): [string, any] => [
                        child.id,
                        new this.GameSymbolClass(gameSymbolsConfig, {
                            actions: this._parentActions,
                            props: this._parentProps,
                            sgActions: this._sgActions,
                        }),
                    ]),
            );

            // Run through a loop to add the mapped classes to the array
            for (let i = 0; i < scConfig.BaseConfig.MainGridElements; i++) {
                const num: number = i + 1;
                const str: string = gameSymbolsConfig.InstancePrefix + String(num);
                this.gameSymbolCards[i] = this._numberCardMap.get(str) as GameSymbolCard; //Make sure we prefix each one with right naming
                this.gameSymbolCards[i].name = str;
                this.gameSymbolCards[i].id = num;
                // alert("game symbol card name is " + name + " , id is " + num + " ,symbol " + this.gameSymbolCards[i].symbol);
            }
        }

        // Build the layout
        this.build(this.layout, this._numberCardMap, this.container);

        // Layout built, now call initNumbers
        this.initSymbolCards();
    }

    /**
     * containsNumber
     * @param id
     */
    private containsNumber(id: string): boolean {
        return /\d/.test(id);
    }

    /**
     * disable
     */
    public disable(): void {
        this.gameSymbolCards.forEach((card: GameSymbolCard) => card.disable());
    }

    /**
     * reset
     */
    public reset(): void {
        this.gameSymbolCards.forEach((card: GameSymbolCard) => card.reset());
    }

    /**
     * initNumbers
     */
    public initSymbolCards(): void {
        this.gameSymbolCards.forEach((card: GameSymbolCard) => card.init());
    }

    /**
     *
     */
    public get unrevealed(): GameSymbolCard[] {
        return this.gameSymbolCards.filter((c: GameSymbolCard) => !c.getRevelead());
    }
}
