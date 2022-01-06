import { BaseView, BaseAction, ParentDef, Button, MobxUtils } from "playa-core";
import { IWProps, IWData, iwProps } from "playa-iw";
import { Container } from "pixi.js";
import { gameStore } from "..";

/**
 * Bonus Accumulator Component
 */
export class BonusAccumulator extends BaseView<IWProps, BaseAction<IWData>, IWProps, null> {
    private static readonly infoButtonEnable: string = "infoButtonEnable";

    // Grab the config
    public static readonly configName: string = "gameConfig.json";

    // Set up some private variables
    private _layoutMap: Map<string, Container>;

    private _infoButtonName: string;

    private _infoButton: Button;

    public constructor(parentProps: IWProps, parentActions: BaseAction<IWData>, assetIds: string[], layoutId: string) {
        const parent = new ParentDef(parentProps, parentActions);
        const data = new IWData();
        const props = new IWProps(data, parentProps);

        super(parent, props, undefined, assetIds, layoutId);

        // Init layout map
        this._layoutMap = new Map();

        // Info button name
        this._infoButtonName = "infoButton";

        // Info button
        this._infoButton = new Button();
    }

    /**
     *
     */
    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Run through the layout map and identify any buttons
        if (this.layout.type === "group") {
            this._layoutMap = new Map(
                this.layout.children
                    .filter((child): boolean => child.id === this._infoButtonName)
                    .map((child): [string, Button] => [child.id, new Button()]),
            );
            this._layoutMap.set(this._infoButtonName, this._infoButton);
        }

        // Build the layout
        this.build(this.layout, this._layoutMap, this.container);

        // Add listeners
        this.addListeners();

        // Add Mobx reaction
        this.addReactions();
    }

    /**
     * Add mobx reactions for showInfoPlaque
     */
    private addReactions(): void {
        // Listen for change in helpAndPaytableControlsEnabled state
        MobxUtils.getInstance().addReaction(
            BonusAccumulator.infoButtonEnable,
            (): boolean => iwProps.helpAndPaytableControlsEnabled,
            (enable: boolean) => {
                this._infoButton.enabled = enable;
            },
            { fireImmediately: true },
        );
    }

    /**
     * Add listeners to close button and toggle
     */
    private addListeners(): void {
        // Add listener to close button
        this._infoButton.on("buttonup", () => {
            this.handleInfoButtonPressed();
        });
    }

    /**
     * handleInfoButtonPressed
     */
    private handleInfoButtonPressed(): void {
        gameStore.actions.revealActions.infoButtonPressed(true);
    }
}
