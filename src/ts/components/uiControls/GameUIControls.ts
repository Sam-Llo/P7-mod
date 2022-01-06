import { UIControls, IWProps, ControlActions } from "playa-iw";
import { Orientation, MobxUtils, systemProps } from "playa-core";
import { Container } from "pixi.js";
import { PlayTicketButtonComponent } from "./buttons/PlayTicketButtonComponent";
import { gameStore } from "..";
import { GameUIsOrientationChangeControl } from "./components/GameUIsOrientationChangeControl";

/**
 * Game UI Controls Group
 * This enables us to implement components on the template side, while being managed by UIControls
 * @extends UIControls
 */
export class GameUIControls extends UIControls {
    public static readonly BTN_PLAY: string = "BTN_PLAY";

    private static readonly orientationChanged: string = "uiOrientationChanged";

    private _gameUIsOrientationChangeControl!: GameUIsOrientationChangeControl;

    public constructor(parentProps: IWProps, parentActions: ControlActions, assetIds: string[], layoutId: string) {
        super(parentProps, parentActions, assetIds, layoutId);

        // Set up the buttons
        this.setControl(GameUIControls.BTN_PLAY, new PlayTicketButtonComponent(this.actions)); //Add new button to the UIControls alongside with its event listener
    }

    /**
     * Init
     */
    protected async init(): Promise<void> {
        // Create a map of the components we need to add, then pass through using setCustomControls
        // These can be included when the layout is built
        super.setCustomControls([["playButton", this.subComponents.get(GameUIControls.BTN_PLAY)]]); // by doing this, we made sure to find the button in layout, we have to make sure the same name is used in layout tool

        // Call init
        super.init();

        // Hide the playButton by default
        this.getControl(GameUIControls.BTN_PLAY).visible = false;

        const revealAllButtonParentContainer = this.container.children.find(
            (obj) => obj.name === "revealAllButton",
        ) as Container;
        const revealAllStartButton = revealAllButtonParentContainer.children.find(
            (obj) => obj.name === "revealAllStartButton",
        );
        const revealAllStopButton = revealAllButtonParentContainer.children.find(
            (obj) => obj.name === "revealAllStopButton",
        );

        this._gameUIsOrientationChangeControl = new GameUIsOrientationChangeControl(
            this.getControl(UIControls.BTN_BUY),
            this.getControl(UIControls.BTN_AUTO_BUY_STOP),
            this.getControl(UIControls.BTN_EXIT),
            this.getControl(GameUIControls.BTN_PLAY),
            this.getControl(UIControls.BTN_MOVE_TO_MONEY_PROMPT),
            this.getControl(UIControls.BTN_RETRY),
            revealAllStartButton,
            revealAllStopButton,
        );
    }

    /**
     * The export from the layout tool defines the DEFAULT position of components
     * But in some cases we may need to move the buttons around, for example if we
     * only have one price point, the price point selector is not shown, so we need to centre
     * the buttons. This would be entirely game dependent, hence the use of the extended class.
     */
    public setCustomPositioning(): void {
        // If we are in a fixed price point scenario (e.g. Phase 1 or single price point Phase 2)
        // Add the reaction for orientationChanged
        if (gameStore.props.isFixedPricePoint) {
            //TODO: might not need this isFixedPricePoint check, so we change the orientation regardlessly
            this.orientationChanged();
        }
    }

    public buyButtonHighlight(highlight: boolean): void {
        this._gameUIsOrientationChangeControl.setBuyButtonHighlight(highlight);
    }

    /**
     * customPositioning object, each orientation is an object, pattern:
     * component - the static identifier
     * x - x position (current used if null)
     * y - y position (current used if null)
     */
    private customPositioning: object = {
        landscape: [{ id: GameUIControls.BTN_BUY, x: 140, y: null }, { id: GameUIControls.BTN_PLAY, x: 140, y: null }], //TODO: might needs to find value for play button's landscape x and portrait x and fill it in here if like to position them differently
        portrait: [{ id: GameUIControls.BTN_BUY, x: 256, y: null }, { id: GameUIControls.BTN_PLAY, x: 256, y: null }], //TODO: might need to other buttons, exit button, retry button into custom positionning if required
    };

    /**
     * orientationChanged
     */
    private orientationChanged(): void {
        MobxUtils.getInstance().addReaction(
            GameUIControls.orientationChanged,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                const orStr: string = orientation === Orientation.LANDSCAPE ? "landscape" : "portrait";
                this.customPositioning[orStr].forEach((obj) => {
                    const { id, x, y } = obj;
                    const component: any = this.getControl(id);
                    const xPos: number = x || component.x;
                    const yPos: number = y || component.y;
                    component.position.set(xPos, yPos);
                });

                //TODO: might need to call orientation change here, if orientation goes weried on UI buttons. But I don't think so, since base class register each button to chaneg orientation by calling registerForOrientationSwap
            },
            { fireImmediately: true },
        );
    }
}
