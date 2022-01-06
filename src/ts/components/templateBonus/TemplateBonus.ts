import {
    BaseAction,
    MobxUtils,
    translationService,
    TextAutoFit,
    ParentDef,
    Orientation,
    systemProps,
} from "playa-core";
import {
    IWData,
    IWProps,
    MarketingScreen,
    IToggle,
    BonusView,
    iwProps,
    RevealAllState,
    OrientationSwap,
} from "playa-iw";
import { Sprite } from "pixi.js";

/**
 * Template Bonus component
 * This could be anything, a wheel, a picker, a wheel picker, or anything between!
 */
export class TemplateBonus extends BonusView {
    private _orientationSwap: OrientationSwap = new OrientationSwap();

    /*public constructor(parentProps: IWProps, parentActions: BaseAction<IWData>, assetIds: string[], layoutId: string, gameId: number) {
        super(parentProps, parentActions, assetIds, layoutId, gameId);
    }*/

    /**
     *
     */
    protected async init(): Promise<void> {
        super.init();

        // Add orientation change
        this.orientationChanged();
    }

    /**
     * Handle Win
     */
    public handleWin(): void {
        super.handleWin();
    }

    /**
     * Handle Loss
     */
    public handleNonWin(): void {
        super.handleNonWin();
    }

    /**
     * Handle entry, so we may need to trigger a spine animation, a PNG sequence etc
     */
    public handleEntry(): void {
        super.handleEntry();
    }

    /**
     * Handle exit, we may need to trigger a spine animation, PNG sequence, or a simple tween
     */
    public handleExit(): void {
        super.handleExit();
    }

    /**
     * Start Reveal All
     * Function public so we can extend and customise Reveal All behaviour
     */
    public handleRevealAllStart(): void {
        alert(`Bonus: ${this._gameId} Reveal All Start`);
    }

    /**
     * Stop Reveal All
     */
    public handleRevealAllStop(): void {
        alert(`Bonus: ${this._gameId} Reveal All Stop`);
    }

    /**
     * orientationChanged
     */
    private orientationChanged(): void {
        // Find the background container
        const bonusBackground: any = this.container.children.find((obj) => obj.name === "bonusBackground");
        // Set suffix strings for portrait and landscape
        const strings: string[] = ["_landscape", "_portrait"];
        // Register with orientationSwap - that will take care of things
        this._orientationSwap.registerContainer({
            container: bonusBackground,
            prefix: false,
            landscapeId: strings[0],
            portraitId: strings[1],
        });
    }
}
