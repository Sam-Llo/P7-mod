import { interaction } from "pixi.js";
import { Button, SpineAnimation } from "playa-core";
import { iwProps } from "playa-iw";
import { IGameSymbolData } from "../../store/GameData";
import { ISymbolCard } from "./ISymbolCard";

/**
 * SymbolCard
 */
export class SymbolCard extends Button implements ISymbolCard {
    protected revealed: boolean = false;

    public matched: boolean = false;

    public reveal: any = undefined; //This is the one that will be to reveal the symbol

    public name: string = "";

    private _id: number = 0;

    public symbol: string = "";

    public get id(): number {
        return this._id;
    }

    public set id(n: number) {
        this._id = n;
    }

    public setMatchAnimRenderable(renderable: boolean) {}

    public constructor() {
        super();

        //Disabled by default
        this.enabled = false;

        ///State
        this.revealed = false;
    }

    /**
     * Called after the button is release following a valid interaction
     * @param ev The original PIXI interaction event dispatched from the container
     */

    protected onButtonUp(ev: interaction.InteractionEvent): void {
        this.reveal();
    }

    /**
     * Called when the pointer moves over the button's hit area
     * @param ev The original PIXI interaction event dispatched from the container
     */
    protected onButtonOver(ev: interaction.InteractionEvent): void {
        this.rollover();
    }

    /**
     * Called when the pointer moves out of the button's hit area
     * @param ev The original PIXI interaction event dispatched from the container
     */
    protected onButtonOut(ev: interaction.InteractionEvent): void {
        this.rollout();
    }

    public getRevelead() {
        return this.revealed;
    }

    /**
     * setStatic
     */
    public setStatic(): void {}

    public isLockAndReelBonusGame(): boolean {
        return false;
    }

    public isWinningSymbol(): boolean {
        return false;
    }

    public isInstantWin(): boolean {
        return false;
    }

    public isSpecialCase(): boolean {
        return false;
    }

    public isInstantWinOrLockAndReelBonusWin(): boolean {
        return false;
    }

    /**
     * enable
     */
    public async enable(): Promise<void> {
        return new Promise((resolve) => {
            //Store the resolve, so that it will gets called at button up (aka. user clicked on this button).
            this.reveal = resolve;
            this.enabled = true;
        }).then(() => {
            this.enabled = false;
            this.revealed = true;
        });
    }

    /**
     * init
     */
    public init(): void {}

    /**
     * disable
     */
    public disable(): void {
        this.enabled = false;
        this.reveal = undefined;
    }

    /**
     * match
     */
    public match(): void {
        this.matched = true;
    }

    /**
     * populate
     */
    public populate(symbol: string): void {}

    /**
     * reset
     */
    public reset(): void {
        this.revealed = false;
        this.matched = false;
        this.enabled = false;
    }

    /**
     * rollover
     */
    protected rollover(): void {}

    /**
     * rollout
     */
    protected rollout(): void {}

    /**
     * uncover
     * @returns Promise<void>
     */
    public async uncover(): Promise<void> {}

    /**
     * customBehaviour
     * We may wish to add behaviour above and beyond simply revealing, for example add a symbol collection that should
     * only be acted upton when the card is completely revealed
     */
    public async customBehaviour(): Promise<void> {}

    /**
     * uncover
     * @returns Promise<void>
     */
    public async presentWin(playWInAnm: boolean = false, waitForDelay: boolean = false): Promise<void> {}

    /**
     * startIdle
     */
    protected startIdle(): void {}

    /**
     * stopIdle
     */
    protected stopIdle(): void {}

    /**
     * bringToFront
     */
    public bringToFront(): void {
        this.parent.setChildIndex(this, this.parent.children.length - 1);
    }

    /**
     * sendToBack
     */
    public sendToBack(): void {
        this.parent.setChildIndex(this, 0);
    }

    /**
     * Set up hit areas for this pick, since layout tool hit area don't like changing position
     */
    public setHitArea(data: { x: number; y: number; width: number; height: number }): void {
        // eslint-disable-next-line no-bitwise
        this.hitArea = new PIXI.Rectangle(data.x, data.y, data.width, data.height);
    }

    public quickRevealSpine() {}

    public quickReveal(gameSymbolCardData: IGameSymbolData) {}

    public afterPresentWin(winAmount: number): void {}

    /**
     * Play Bonus animation then start transition wave after  number of drink glass shakes
     * @param numerOfShakes number of shakes after trigger transition wave
     */
    public async playBonusWinAnimation(numerOfShakes: number) {}
}
