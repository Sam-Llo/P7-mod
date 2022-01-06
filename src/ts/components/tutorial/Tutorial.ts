import { IWProps } from "playa-iw";
import { ParentDef, Button, Checkbox, LayoutBuilder } from "playa-core";
import { Container, DisplayObject } from "pixi.js";
import { TutorialCommands } from "./commands/TutorialCommands";
import { AnimatedPlaque } from "../plaque/AnimatedPlaque";

export * from "./commands/TutorialCommands";

/**
 * Tutorial class export
 * We extend BasicPlaque, which in turn extends BaseView, which is the only way to access the container
 */
export class Tutorial extends AnimatedPlaque<IWProps, TutorialCommands> {
    // Grab the config
    static readonly configName: string = "gameConfig.json";

    // Set up some statics
    public static readonly TUTORIAL_OPEN: string = "OPEN";

    public static readonly TUTORIAL_CLOSE: string = "CLOSE";

    // Set up some private variables
    private _layoutMap: Map<string, Button | Checkbox> = new Map();

    private _indicatorMap: Map<string, Container> = new Map();

    private _pageMap: Map<string, Container> = new Map();

    private defaultPage: number = 1;

    private currentPage: number = 1;

    private numberOfPages: number = 1;

    private tutorialPagePrefix: string = "tutorialPage";

    private tutorialIndicatorPrefix: string = "tutorialIndicator";

    private INDICATOR_ACTIVE = "Active";

    private INDICATOR_INACTIVE = "Inactive";

    // Set up a tutorial close button
    private tutorialCloseButton: Button;

    private tutorialLeftArrowButton: Button;

    private tutorialRightArrowButton: Button;

    public constructor(parentProps: IWProps, assetsIds: string[], layoutId: string) {
        // This is a constructor from a derived class
        // As we're using an animated plaque, we can pass through the tween properties
        super(new ParentDef(parentProps, null), undefined, assetsIds, layoutId);
        // Instantiate buttons
        this.tutorialCloseButton = new Button();
        this.tutorialLeftArrowButton = new Button();
        this.tutorialRightArrowButton = new Button();
    }

    // Function for setting commands (called from main.init())
    public setCommands(inSet: TutorialCommands) {
        this._commands = inSet;
    }

    // Init promise
    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Run through the layout map and identify any buttons
        if (this.layout.type === "group") {
            this._layoutMap = new Map(
                this.layout.children
                    .filter((child): boolean => child.id.endsWith("Button"))
                    .map((child): [string, Button] => [child.id, new Button()]),
            );
            this._layoutMap.set("tutorialCloseButton", this.tutorialCloseButton);
            this._layoutMap.set("tutorialLeftArrowButton", this.tutorialLeftArrowButton);
            this._layoutMap.set("tutorialRightArrowButton", this.tutorialRightArrowButton);
        }

        // Build the layout
        LayoutBuilder.build(this.layout, this._layoutMap, this.container);

        // Grab the external config
        const plaqueConfig = this.assets.get(Tutorial.configName).PlaqueConfig.Tutorial;
        const gameConfig = this.assets.get(Tutorial.configName).GameOptions;
        // Set the animated plaque properties
        super.setProps(plaqueConfig);

        // The container is accessible now, so bring to front and visible false
        this.container.zIndex = 9999;
        this.container.visible = false;

        // Set up the content
        this.initContent();

        // Add event listeners
        this.addListeners();

        // Set up the indicators
        this.initIndicators();

        // Work out exactly how many pages this tutorial has
        this.findNumberOfPages();

        // Show default page
        this.goToPage(this.defaultPage);

        // Plaque is hidden by default, show if showHowToPlayOnLoad is set to true
        if (gameConfig.showHowToPlayOnLoad) {
            super.show();
        }

        // Temp, set version number
        this.setVersionNumber("0.3.3.1");
    }

    /**
     * Add listeners to the buttons
     */
    protected addListeners(): void {
        // Add the equivalent of event listeners to the buttons
        // Tutorial close button will always just close the tutorial, no questions asked
        this.tutorialCloseButton.on("pointerup", () => {
            this.handleTutorialClose();
        });
        this.tutorialLeftArrowButton.on("pointerup", () => {
            this.goToPage(this.currentPage - 1);
        });
        this.tutorialRightArrowButton.on("pointerup", () => {
            this.goToPage(this.currentPage + 1);
        });
    }

    /**
     * Create content map
     */
    protected initContent(): void {}

    /**
     * Create indicator map
     */
    protected initIndicators(): void {
        this._indicatorMap = new Map(
            this.container.children
                .filter((child): boolean => child.name.startsWith("tutorialIndicator"))
                .map((child): [string, Container] => [child.name, child as Container]),
        );
    }

    /**
     * Find number of pages
     */
    protected findNumberOfPages(): void {
        // Should be simple enough, run through and work out how many children start with tutorialPage
        this._pageMap = new Map(
            this.container.children
                .filter((child): boolean => child.name.startsWith("tutorialPage"))
                .map((child): [string, Container] => [child.name, child as Container]),
        );

        // We have found the number of pages
        this.numberOfPages = this._pageMap.size;

        // Only show the page navigation buttons if we have more than one page
        this.tutorialLeftArrowButton.visible = this.numberOfPages > 1;
        this.tutorialRightArrowButton.visible = this.numberOfPages > 1;
    }

    /**
     * handleTutorialClose
     */
    protected handleTutorialClose(): void {
        this.hide();
    }

    /**
     * Handle page change
     */
    protected goToPage(pageIndex: number): void {
        let pI = pageIndex;
        // If we're out of range, reset to default
        if (pageIndex > this.numberOfPages) {
            pI = this.defaultPage;
        }

        // If we've gone below 1, set to max
        if (pageIndex < 1) {
            pI = this.numberOfPages;
        }

        // Set current page
        this.currentPage = pI;

        // Set the relevant indicator
        this.setIndicator();

        // By this point we know exactly what currentPage is
        // So we need to run through the page map and show the relevant one based on the name
        this._pageMap.forEach((value: Container, key: string) => {
            value.visible = key === this.tutorialPagePrefix + this.currentPage;
        });
    }

    /**
     * Show the relevant indicator
     */
    protected setIndicator(): void {
        // If we have fewer than 2 indicators or fewer than 2 pages, hide all indicators and return
        if (this._indicatorMap.size < 2 || this.numberOfPages < 2) {
            this._indicatorMap.forEach((value: Container) => {
                value.visible = false;
            });
            return;
        }

        // Run through the indicator map
        this._indicatorMap.forEach((indicator: Container, key: string) => {
            // Run through the children of each indicator
            indicator.children.forEach((state: DisplayObject) => {
                // Hide by default
                state.visible = false;
                // If this is not the current page, show the inactive one
                // If this is the current page, show the active one
                if (key === this.tutorialIndicatorPrefix + this.currentPage) {
                    state.visible = state.name.indexOf(this.INDICATOR_ACTIVE) > -1;
                } else {
                    state.visible = state.name.indexOf(this.INDICATOR_INACTIVE) > -1;
                }
            });
        });
    }

    /**
     * Public facing hide function
     */
    public hide(): void {
        super.hide();
    }

    /**
     * Public facing show function
     */
    public show(): void {
        super.show();
    }

    /**
     * getCloseButton
     */
    public getCloseButton(): any {
        return this.tutorialCloseButton;
    }

    /**
     * Set version number
     */
    public setVersionNumber(version: string): void {
        this.container.children.forEach((obj: any) => {
            if (obj.name === "versionNumber") {
                obj.text = version;
            }
        });
    }
}
