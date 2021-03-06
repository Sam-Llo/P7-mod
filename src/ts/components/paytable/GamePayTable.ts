import { Ease, TimelineMax } from "gsap";
import { Container, DisplayObject, Sprite } from "pixi.js";
import {
    BaseAction,
    BaseView,
    currencyService,
    LayoutBuilder,
    MobxUtils,
    Orientation,
    ParentDef,
    SpineAnimation,
    systemProps,
    TextAutoFit,
} from "playa-core";
import { IWData, iwProps, IWProps } from "playa-iw";
import { gameStore } from "..";
import { InitialSymbolSelectionReelCommands } from "./commands/InitialSymbolSelectionReelCommands";
import { InitialSymbolSelectionReel } from "./components/InitialSymbolSelectionReel";

/**
 * GamePayTable
 * TODO: this will be highlight the revelant win symbols count reward column
 */
export class GamePayTable extends BaseView<IWProps, BaseAction<IWData>, IWProps, InitialSymbolSelectionReelCommands> {
    private _mobxUtils: MobxUtils = MobxUtils.getInstance();

    public static readonly initialSymbolSelectionConfig = "initialSymbolSectionReel.json";

    private static readonly orientationChanged: string = "uiOrientationChanged";

    public static readonly configName = "gamePaytableConfig.json";

    private _config;

    private _initialSymbolSelectionReel!: InitialSymbolSelectionReel;

    private _glowAnim!: SpineAnimation;

    private _symbolSelectAnim!: SpineAnimation;

    private _symbolSelectAnimPrt!: SpineAnimation;

    private _paytableAnimSpine!: SpineAnimation;

    private _paytableAnimSpinePrt!: SpineAnimation;

    private _paytableFrame!: Sprite;

    private _paytableFramePrt!: Sprite;

    private _winFindLabelText3!: TextAutoFit;

    private _winFindLabelText4!: TextAutoFit;

    private _winFindLabelText5!: TextAutoFit;

    private _winFindLabelText6!: TextAutoFit;

    private _winFindLabelText7!: TextAutoFit;

    private _winFindLabelText8!: TextAutoFit;

    private _winFindLabelText9!: TextAutoFit;

    private _winFindLabelText10!: TextAutoFit;

    private _winFindLabelText11!: TextAutoFit;

    private _winFindLabelText12!: TextAutoFit;

    private _winAmountText3!: TextAutoFit;

    private _winAmountText4!: TextAutoFit;

    private _winAmountText5!: TextAutoFit;

    private _winAmountText6!: TextAutoFit;

    private _winAmountText7!: TextAutoFit;

    private _winAmountText8!: TextAutoFit;

    private _winAmountText9!: TextAutoFit;

    private _winAmountText10!: TextAutoFit;

    private _winAmountText11!: TextAutoFit;

    private _winAmountText12!: TextAutoFit;

    private _currentHighlightedMultiplierNum!: number; //TODO: might not need this, because we have another one with similar names

    private _selectedBonusHighLightTimeLine;

    private static originalTintColour = 0xffffff;

    private static highlightTintColour = 0xffff00;

    public constructor(parentProps: IWProps, parentAction: BaseAction<IWData>, assetIds: string[], layoutId: string) {
        super(
            new ParentDef(parentProps, parentAction),
            new IWProps(new IWData(), parentProps),
            undefined,
            assetIds,
            layoutId,
        );

        this._initialSymbolSelectionReel = new InitialSymbolSelectionReel(
            [GamePayTable.initialSymbolSelectionConfig],
            "initialWinningSymbolsSelection",
            new Ease(),
            GamePayTable.initialSymbolSelectionConfig,
            false,
        );

        this._currentHighlightedMultiplierNum = 0;
    }

    protected async init(): Promise<void> {
        super.init();
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build layout
        LayoutBuilder.build(this.layout, new Map(), this.container);
        this._config = this.assets.get(GamePayTable.configName);

        this._paytableAnimSpine = this.container.children.find(
            (obj) => obj.name === `PayTableMainGame_anim`,
        ) as SpineAnimation;
        this._paytableAnimSpine.updateTransform();
        this._paytableAnimSpine.setAnimation(this._config.LandscapeGamePaytableStaticAnimtionName);
        this._paytableAnimSpine.play();

        this._paytableAnimSpinePrt = this.container.children.find(
            (obj) => obj.name === `PayTableMainGame_anim_prt`,
        ) as SpineAnimation;
        this._paytableAnimSpinePrt.updateTransform();
        this._paytableAnimSpinePrt.setAnimation(this._config.PortraitGamePaytableStaticAnimtionName);
        this._paytableAnimSpinePrt.play();

        this._paytableAnimSpine.renderable = systemProps.orientation === Orientation.LANDSCAPE;
        this._paytableAnimSpinePrt.renderable = !this._paytableAnimSpine.renderable;

        this._paytableFrame = this.container.children.find((obj) => obj.name === `paytableFrameBG_img.png`) as Sprite;

        this._paytableFramePrt = this.container.children.find(
            (obj) => obj.name === `paytableFrameBG_prt_img.png`,
        ) as Sprite;

        this._paytableFrame.renderable = systemProps.orientation === Orientation.LANDSCAPE;
        this._paytableFramePrt.renderable = !this._paytableFrame.renderable;

        this._glowAnim = this.container.children.find(
            (obj) => obj.name === `initialWinningSymbolsSelection_glow_anim`,
        ) as SpineAnimation;
        this._glowAnim.renderable = false;

        this._glowAnim.spine.state.addListener({
            complete: (entry) => {
                // alert("finishes play glow anim");
                this._glowAnim.setToSetupPose();
                this._glowAnim.spine.state.tracks = [];
                this._glowAnim.renderable = false;
            },
        });

        this._symbolSelectAnim = this.container.children.find(
            (obj) => obj.name === `Symbol Select_anim`,
        ) as SpineAnimation;

        this._symbolSelectAnim.updateTransform();
        this._symbolSelectAnim.setAnimation("static/selector/landscape/Selector landscape static");
        this._symbolSelectAnim.play();

        this._symbolSelectAnimPrt = this.container.children.find(
            (obj) => obj.name === `Symbol Select_anim_prt`,
        ) as SpineAnimation;

        this._symbolSelectAnimPrt.updateTransform();
        this._symbolSelectAnimPrt.setAnimation("static/selector/portrait/Selector portrait static");
        this._symbolSelectAnimPrt.play();

        this._symbolSelectAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
        this._symbolSelectAnimPrt.renderable = !this._symbolSelectAnim.renderable;
        //t
        this.findPaytableElements(); // Layout tool base one

        this.addReactions();
    }

    private findPaytableElements() {
        this.findPaytableElementByMultiplierNumber(3);
        this.findPaytableElementByMultiplierNumber(4);
        this.findPaytableElementByMultiplierNumber(5);
        this.findPaytableElementByMultiplierNumber(6);
        this.findPaytableElementByMultiplierNumber(7);
        this.findPaytableElementByMultiplierNumber(8);
        this.findPaytableElementByMultiplierNumber(9);
        this.findPaytableElementByMultiplierNumber(10);
        this.findPaytableElementByMultiplierNumber(11);
        this.findPaytableElementByMultiplierNumber(12);
    }

    private findPaytableElementByMultiplierNumber(num: number) {
        const symbolPaytable = this.container.children.find((obj) => obj.name === `symbolPaytable${num}`) as Container;
        this[`${this._config.WinFindLabelTextPrefix}${num}`] = symbolPaytable.children.find((obj) =>
            obj.name.includes("find_value"),
        ) as TextAutoFit;
        this[`${this._config.WinAmountValueTextPrefix}${num}`] = symbolPaytable.children.find((obj) =>
            obj.name.includes("win_value"),
        ) as TextAutoFit;
    }

    public resetAndSpinForever() {
        //TODO: if game is in progress, then just set the winning symbol to the winning one, instead of spin again
        this._initialSymbolSelectionReel.spinWithoutLanding();

        //play reset animation for the symbol select
        //  if (systemProps.orientation === Orientation.LANDSCAPE) {

        // this._symbolSelectAnimPrt.visible = false;
        //this._symbolSelectAnim.visible = true;
        this._symbolSelectAnim.updateTransform();
        this._symbolSelectAnim.setAnimation("reset/landscape/Selector landscape reset white", undefined, false);
        this._symbolSelectAnim.play();
        // } else if (systemProps.orientation === Orientation.PORTRAIT) {

        // }
        // this._symbolSelectAnim.visible = false;
        //this._symbolSelectAnimPrt.visible = true;
        this._symbolSelectAnimPrt.updateTransform();
        this._symbolSelectAnimPrt.setAnimation("reset/portrait/Selector portrait reset white", undefined, false); //will need to set this to reset white once i get updated anim
        this._symbolSelectAnimPrt.play();
    }

    public land(symbolToLand: string, onCompleteCallback) {
        this._initialSymbolSelectionReel.landAndSetOnCompleteCallback(symbolToLand, onCompleteCallback);
    }

    public playGlowAnimation() {
        this._glowAnim.renderable = true;
        this._glowAnim.updateTransform();
        this._glowAnim.setAnimation("glow", undefined, false); //NOTE: sometimes, just call setAnimation with "name" without additional paramters does not work

        this._glowAnim.play();
        //if (systemProps.orientation === Orientation.LANDSCAPE) {
        this._symbolSelectAnim.updateTransform();
        this._symbolSelectAnim.setAnimation(
            "reveal/selector/landscape/Selector landscape reveal white",
            undefined,
            false,
        );
        this._symbolSelectAnim.play();

        this._symbolSelectAnimPrt.updateTransform();
        this._symbolSelectAnimPrt.setAnimation(
            "reveal/selector/portrait/Selector portrait reveal white",
            undefined,
            false,
        );
        this._symbolSelectAnimPrt.play();
    }

    public setLandingSymbolWithoutSpin(landingSymbol: string) {
        this._initialSymbolSelectionReel.setLandingSymbolWithoutSpin(landingSymbol);
    }

    /**
     * Set commands
     */
    public setCommands(commandsSet: InitialSymbolSelectionReelCommands) {
        this._commands = commandsSet;
    }

    public setUpPayTable() {
        for (let i = this._config.MaxWinningSymbolsCount; i >= this._config.LeastWinningSymbolsCount; i--) {
            const value = iwProps.prizeTable.get(`${this._config.BaseGamePrizeDivisionPrefix}${i}`) || 0;
            this[`${this._config.WinAmountValueTextPrefix}${i}`].text = currencyService.format(
                value,
                iwProps.denomination,
            );
        }
    }

    private addReactions() {
        this._mobxUtils.addReaction(
            "gamePayTable_reset",
            () => iwProps.wager,
            () => {
                this.setUpPayTable();
            },
            { fireImmediately: true },
        );

        MobxUtils.getInstance().addReaction(
            GamePayTable.orientationChanged,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                //this._paytableAnimSpine.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                //this._paytableAnimSpinePrt.renderable = !this._paytableAnimSpine.renderable;

                this._symbolSelectAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                this._symbolSelectAnimPrt.renderable = !this._symbolSelectAnim.renderable;
            },
        );

        MobxUtils.getInstance().addReaction(
            GamePayTable.orientationChanged,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                this._paytableAnimSpine.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                this._paytableAnimSpinePrt.renderable = !this._paytableAnimSpine.renderable;
            },
        );

        MobxUtils.getInstance().addReaction(
            GamePayTable.orientationChanged,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                this._paytableFrame.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                this._paytableFramePrt.renderable = !this._paytableFrame.renderable;
            },
        );

        MobxUtils.getInstance().addReaction(
            "totalWinningSymbolsCountChangedReaction",
            () => gameStore.props.totalWinningSymbolsCount,
            (totalWinningSymbolsCount: number) => {
                if (totalWinningSymbolsCount >= this._config.LeastWinningSymbolsCount) {
                    this.playGlowAnimation();
                    this._initialSymbolSelectionReel.playPulsingAnimation();
                    this.playWinHighlights(totalWinningSymbolsCount);
                } else if (totalWinningSymbolsCount === 0) {
                    this.fadeOutWinTableHighlightsOnNewGameStart();
                }
            },
            { fireImmediately: true },
        );
    }

    private turnCurrentlyHighlightedWinningNumbersToNormalColour() {
        const timeline = new TimelineMax();
        //change back to normal colour
        timeline.fromTo(
            [
                this[`${this._config.WinFindLabelTextPrefix}${this._currentHighlightedMultiplierNum}`],
                this[`${this._config.WinAmountValueTextPrefix}${this._currentHighlightedMultiplierNum}`],
            ],
            this._config.FlashingTextAnimationLength,
            { tint: GamePayTable.highlightTintColour },
            { tint: GamePayTable.originalTintColour },
            "0",
        );
    }

    private highlightTransitionWinningAmounts(startingIndex: number, currentMultiplier: number) {
        for (let i = startingIndex; i < currentMultiplier; i++) {
            const timeline = new TimelineMax();
            timeline.fromTo(
                [
                    this[`${this._config.WinFindLabelTextPrefix}${i}`],
                    this[`${this._config.WinAmountValueTextPrefix}${i}`],
                ],
                this._config.TransitionFlashingTextAnimationLength,
                { tint: GamePayTable.originalTintColour },
                { tint: GamePayTable.highlightTintColour },
                "0",
            );
            timeline.fromTo(
                [
                    this[`${this._config.WinFindLabelTextPrefix}${i}`],
                    this[`${this._config.WinAmountValueTextPrefix}${i}`],
                ],
                this._config.TransitionFlashingTextAnimationLength,
                { tint: GamePayTable.highlightTintColour },
                { tint: GamePayTable.originalTintColour },
                `<${this._config.TransitionFlashingTextAnimationLength}`,
            );
        }
    }

    private highlightCurrentWinningAmountTexts(currentMultiplier: number) {
        this._selectedBonusHighLightTimeLine = new TimelineMax();

        this._selectedBonusHighLightTimeLine.fromTo(
            [
                this[`${this._config.WinFindLabelTextPrefix}${currentMultiplier}`],
                this[`${this._config.WinAmountValueTextPrefix}${currentMultiplier}`],
            ],
            this._config.FlashingTextAnimationLength,
            { tint: GamePayTable.originalTintColour },
            { tint: GamePayTable.highlightTintColour },
            "0",
        );

        this._paytableAnimSpine.updateTransform();
        this._paytableAnimSpine.setAnimation(`${this._config.LandscapeFadeInWinAnimPrefix}${currentMultiplier}`);
        this._paytableAnimSpine.play();
        this._paytableAnimSpinePrt.updateTransform();
        this._paytableAnimSpinePrt.setAnimation(`${this._config.PortraitFadeInWinAnimPrefix}${currentMultiplier}`);
        this._paytableAnimSpinePrt.play();
    }

    private playWinHighlights(currentMultiplier: number) {
        let isFirstTime = false;
        if (this._currentHighlightedMultiplierNum < this._config.LeastWinningSymbolsCount) {
            this._currentHighlightedMultiplierNum = this._config.LeastWinningSymbolsCount;
            isFirstTime = true;
        }

        //TODO: might need to add this back in if we need to deal with complex timeLine
        if (this._selectedBonusHighLightTimeLine) {
            this._selectedBonusHighLightTimeLine.kill();
            this._selectedBonusHighLightTimeLine = undefined;
        }
        if (isFirstTime === false) {
            this.turnCurrentlyHighlightedWinningNumbersToNormalColour();
        }
        const amountToGoUp = currentMultiplier - this._currentHighlightedMultiplierNum;
        if (amountToGoUp > 1 || isFirstTime) {
            //Player has collect more than one winning symbols during this spin
            //we have to briefly light up the middle transition ones
            const startingIndex = isFirstTime
                ? this._currentHighlightedMultiplierNum
                : this._currentHighlightedMultiplierNum + 1;

            this.highlightTransitionWinningAmounts(startingIndex, currentMultiplier);
        }

        this.highlightCurrentWinningAmountTexts(currentMultiplier);

        //Note: since this method does not really pause at all, byt setting current highlight multiplier number, we made sure there is no overlap between successive calls.
        this._currentHighlightedMultiplierNum = currentMultiplier;
    }

    private fadeOutWinTableHighlightsOnNewGameStart() {
        if (this._currentHighlightedMultiplierNum >= this._config.LeastWinningSymbolsCount) {
            /*  this._paytableAnimSpine.updateTransform();
            this._paytableAnimSpine.setAnimation(
                `${this._config.LandscapeFadeOutWinAnimPrefix}${this._currentHighlightedMultiplierNum}`, */
            // );
            //  this._paytableAnimSpine.play();

            /*  this._paytableAnimSpinePrt.updateTransform();
            this._paytableAnimSpinePrt.setAnimation(
                `${this._config.PortraitFadeOutWinAnimPrefix}${this._currentHighlightedMultiplierNum}`,
            );
            this._paytableAnimSpinePrt.play(); */
            const selectedBonusHighLightTimeLine = new TimelineMax();
            selectedBonusHighLightTimeLine.fromTo(
                [
                    this[`${this._config.WinFindLabelTextPrefix}${this._currentHighlightedMultiplierNum}`],
                    this[`${this._config.WinAmountValueTextPrefix}${this._currentHighlightedMultiplierNum}`],
                ],
                this._config.FlashingTextAnimationLength,
                { tint: GamePayTable.highlightTintColour },
                { tint: GamePayTable.originalTintColour },
                "0",
            );
        }
        this._currentHighlightedMultiplierNum = 0;
    }
}
