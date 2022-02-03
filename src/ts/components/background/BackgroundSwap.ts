import { TweenMax } from "gsap";
import { DisplayObject } from "pixi.js";
import {
    Background,
    BaseAction,
    BaseView,
    gameActions,
    GameActions,
    GameFlow,
    LayoutBuilder,
    layoutService,
    loaderService,
    MobxUtils,
    Orientation,
    ParentDef,
    SpineAnimation,
    Stage,
    StageActions,
    stageService,
    StorageService,
    StorageTypes,
    systemProps,
} from "playa-core";
import { LayoutProps } from "playa-core/dist/layout/layoutProps";
import { StageProps } from "playa-core/dist/stage/StageProps";
import { MarketingScreen, IToggle, IWData, IWProps, iwProps, iwActions } from "playa-iw";
import { Container } from "react-pixi-fiber";
import { gameStore, MarketingScreenSettings } from "..";
import { GameIDs } from "../../main";
import { GameProps } from "../store/GameProps";
import { LayoutUtils } from "../utils/LayoutUtils";

/**
 * BackgroundSwap
 */
export class BackgroundSwap extends BaseView<any, null, any, null> {
    private static readonly orientationChanged: string = "backgroundOrientationChanged";

    private static readonly baseGameVisible: string = "symbolsCollectionBaseGameVisible";

    private static readonly winPlaqueIsUp: string = "winPlaqueIsUpSetBackground";

    private static readonly marketingScreenisOff: string = "logoVisible";

    private static readonly STRINGS_BONUS_WIN_LAN: string = "LandscapeLightBonusWin";

    private static readonly STRINGS_BONUS_WIN_POT: string = "PortraitLightBonusWin";

    private static readonly DELAY_BONUS_BACKGROUND_LANDSCAPE: number = 0.35;

    private static readonly DELAY_BONUS_BACKGROUND_PORTRAIT: number = 0.65;

    private static readonly RANDOM_TIME_STRINGS_LIGHTS: number = 2;

    //Animated Lanscape background
    private bgBaseGameAnimLand!: SpineAnimation;

    //Animated Potrait background
    private bgBaseGameAnimPort!: SpineAnimation;

    //Animated Logo
    public bgBaseGameLogoAnim!: SpineAnimation;

    private bgBaseGameLogoAnimPrt!: SpineAnimation;

    private stringOfLightsBonusGameAnim!: SpineAnimation;

    private stringOfLightsBonusGameAnimPort!: SpineAnimation;

    private stage!: Stage;

    private testContainer!: string;

    private marketingscreen!: Container;

    public constructor(layoutId: string) {
        super(new ParentDef(null, null), {}, undefined, [], layoutId);
    }

    /**
     * init
     */
    protected async init(): Promise<void> {
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build layout
        LayoutBuilder.build(this.layout, new Map(), this.container);

        //Find the portrait and landscape animated logos inside Layout
        this.bgBaseGameLogoAnim = this.container.children.find((obj) => obj.name === "gameLogo_anim") as SpineAnimation;
        this.bgBaseGameLogoAnim.updateTransform();
        this.bgBaseGameLogoAnim.setAnimation("landscape logo animation", undefined, true);
        this.bgBaseGameLogoAnim.play();

        this.bgBaseGameLogoAnimPrt = this.container.children.find(
            (obj) => obj.name === "gameLogo_anim_prt",
        ) as SpineAnimation;

        this.bgBaseGameLogoAnimPrt.updateTransform();
        this.bgBaseGameLogoAnimPrt.setAnimation("portrait logo animation", undefined, true);
        this.bgBaseGameLogoAnimPrt.play();

        this.bgBaseGameLogoAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
        this.bgBaseGameLogoAnimPrt.renderable = !this.bgBaseGameLogoAnim.renderable;

        //Find the portrait and landscape animated background inside Layout
        this.bgBaseGameAnimLand = this.container.children.find(
            (obj) => obj.name === "backGround_anim",
        ) as SpineAnimation;
        /* LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this.bgBaseGameAnimLand,
            "non Trans/logo",
            "non Trans/logo",
            loaderService.fromCache("beachyBonusWithSurfboardLogo"),
        ); */
        this.bgBaseGameAnimPort = this.container.children.find(
            (obj) => obj.name === "backGround_anim_prt",
        ) as SpineAnimation;
        /*  LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this.bgBaseGameAnimPort,
            "non Trans/logo",
            "non Trans/logo",
            loaderService.fromCache("beachyBonusWithSurfboardLogo"),
        ); */
        this.stringOfLightsBonusGameAnim = this.container.children.find(
            (obj) => obj.name === "stringOfLightsBonus_anim",
        ) as SpineAnimation;

        this.stringOfLightsBonusGameAnimPort = this.container.children.find(
            (obj) => obj.name === "stringOfLightsBonus_anim_prt",
        ) as SpineAnimation;

        this.bgBaseGameAnimLand.updateTransform();
        this.bgBaseGameAnimPort.updateTransform();
        //this.bgBaseGameLogoAnim.updateTransform();

        this.bgBaseGameAnimLand.setAnimation("landscape animation background3", undefined, true);
        this.bgBaseGameAnimPort.setAnimation("portrait animation background3", undefined, true);
        //this.bgBaseGameLogoAnim.setAnimation("landscape logo animation", undefined, true);
        // this.bgBaseGameLogoAnim.setAnimation("portrait logo animation", undefined, true);

        this.bgBaseGameAnimLand.play();
        this.bgBaseGameAnimPort.play();
        // this.bgBaseGameLogoAnim.play();
        this.bgBaseGameAnimLand.renderable = systemProps.orientation === Orientation.LANDSCAPE;
        this.bgBaseGameAnimLand.visible = systemProps.orientation === Orientation.LANDSCAPE;
        this.bgBaseGameAnimPort.renderable = !this.bgBaseGameAnimLand.renderable;
        this.bgBaseGameAnimPort.visible = !this.bgBaseGameAnimLand.visible;

        this.addReactions();
    }

    /**
     * addReactions
     */
    private addReactions(): void {
        MobxUtils.getInstance().addReaction(
            BackgroundSwap.orientationChanged,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                //Called when Orientation got changed
                this.bgBaseGameAnimLand.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                this.bgBaseGameAnimLand.visible = systemProps.orientation === Orientation.LANDSCAPE;
                this.bgBaseGameAnimPort.renderable = !this.bgBaseGameAnimLand.renderable;
                this.bgBaseGameAnimPort.visible = !this.bgBaseGameAnimLand.visible;
                this.setStringOfLightsVisibilitiesBaseOnOrientation();

                this.bgBaseGameLogoAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
                this.bgBaseGameLogoAnimPrt.renderable = !this.bgBaseGameLogoAnim.renderable;

                this.bgBaseGameLogoAnim.updateTransform();
                this.bgBaseGameLogoAnim.setAnimation("landscape logo animation", undefined, true);
                this.bgBaseGameLogoAnim.play();

                this.bgBaseGameLogoAnimPrt.updateTransform();
                this.bgBaseGameLogoAnimPrt.setAnimation("portrait logo animation", undefined, true);
                this.bgBaseGameLogoAnimPrt.play();

                // setting logo animation depending on orientation
                /*  if (systemProps.orientation === Orientation.LANDSCAPE) {
                    this.bgBaseGameLogoAnim.visible = systemProps.orientation === Orientation.LANDSCAPE;
                    this.bgBaseGameLogoAnim.setAnimation("landscape logo animation", undefined, true);
                    this.bgBaseGameLogoAnim.play();
                } else if (systemProps.orientation === Orientation.PORTRAIT) {
                    this.bgBaseGameLogoAnim.visible = systemProps.orientation === Orientation.PORTRAIT;
                    this.bgBaseGameLogoAnim.setAnimation("portrait logo animation", undefined, true);
                    this.bgBaseGameLogoAnim.play();
                } */
            },
            { fireImmediately: true },
        );

        MobxUtils.getInstance().addReaction(
            BackgroundSwap.winPlaqueIsUp,
            () => gameStore.props.winPlaqueIsUp,
            (iswinPlaqueIsUp: boolean) => {
                this.bgBaseGameAnimLand.setAnimation("landscape animation background", undefined, true);
                this.bgBaseGameAnimPort.setAnimation("portrait animation background", undefined, true);

                if (!iswinPlaqueIsUp) {
                    this.bgBaseGameAnimLand.setAnimation("landscape animation background2", undefined, true);
                    this.bgBaseGameAnimPort.setAnimation("portrait animation background2", undefined, true);
                }
            },
            { fireImmediately: false },
        );

        MobxUtils.getInstance().addReaction(
            BackgroundSwap.marketingScreenisOff,
            () => gameStore.props.marketingScreenisOff,
            (ismarketingScreenisOff: boolean) => {
                this.bgBaseGameLogoAnim.visible = true;
                this.bgBaseGameLogoAnimPrt.visible = true;
                this.bgBaseGameAnimLand.setAnimation("landscape animation background2", undefined, true);
                this.bgBaseGameAnimPort.setAnimation("portrait animation background2", undefined, true);

                if (!ismarketingScreenisOff) {
                    // this.bgBaseGameAnimLand.setAnimation("landscape animation background2", undefined, true);
                    // this.bgBaseGameAnimPort.setAnimation("portrait animation background2", undefined, true);
                }
            },
            { fireImmediately: false },
        );
        /* MobxUtils.getInstance().addReaction(
            BackgroundSwap.marketingScreenOff,
            () => this.props.MarketingScreenSettings._marketScreenOff,
            (_marketScreenOff: boolean) => {
                    if (!_marketScreenOff){ */
        /*   this.bgBaseGameLogoAnim.visible = true;
                        this.bgBaseGameLogoAnimPrt.visible = true;
                        console.log("LOGO FALSE")
 */

        // }else{
        /*         this.bgBaseGameLogoAnim.visible = true;
                        this.bgBaseGameLogoAnimPrt.visible = true;
                        console.log("LOGO TRUE")
                     */

        // }
        // },
        //   { fireImmediately: true },
        //  );

        MobxUtils.getInstance().addReaction(
            BackgroundSwap.baseGameVisible,
            () => gameStore.props.baseGameVisible,
            (isBaseGameVisible: boolean) => {
                this.setStringOfLightsVisibilitiesBaseOnOrientation();
                this.startPlaytingStringsOfLightsAnimation();
                if (!isBaseGameVisible) {
                    this.bgBaseGameAnimLand.y = 600; //350
                    this.bgBaseGameAnimLand.updateTransform();
                    this.bgBaseGameAnimPort.updateTransform();
                    this.bgBaseGameLogoAnim.visible = false;
                    this.bgBaseGameLogoAnimPrt.visible = false;
                    TweenMax.delayedCall(BackgroundSwap.DELAY_BONUS_BACKGROUND_LANDSCAPE, () => {
                        this.bgBaseGameAnimLand.setAnimation("landscape bouns reveal background", undefined, false);
                        this.bgBaseGameAnimLand.play();

                        // this.bgBaseGameAnimPort.setAnimation("portrait bonus reveal background", undefined, false);
                        //this.bgBaseGameAnimPort.play();
                    });
                    TweenMax.delayedCall(BackgroundSwap.DELAY_BONUS_BACKGROUND_PORTRAIT, () => {
                        this.bgBaseGameAnimPort.setAnimation("portrait bonus reveal background", undefined, false);
                        //  this.bgBaseGameAnimPort.play();
                    });
                } else {
                    this.bgBaseGameAnimLand.y = 350; //350
                    this.bgBaseGameAnimLand.updateTransform();
                    this.bgBaseGameAnimPort.updateTransform();
                    this.bgBaseGameAnimLand.setAnimation("landscape animation background", undefined, true);
                    this.bgBaseGameAnimPort.setAnimation("portrait animation background", undefined, true);
                    this.bgBaseGameAnimLand.play();
                    this.bgBaseGameAnimPort.play();
                    this.bgBaseGameLogoAnim.visible = true;
                    this.bgBaseGameLogoAnimPrt.visible = true;
                }
            },
            { fireImmediately: false },
        );
    }

    private setStringOfLightsVisibilitiesBaseOnOrientation(): void {
        if (gameStore.props.baseGameVisible === false) {
            this.stringOfLightsBonusGameAnim.renderable = systemProps.orientation === Orientation.LANDSCAPE;
            this.stringOfLightsBonusGameAnim.visible = systemProps.orientation === Orientation.LANDSCAPE;
            this.stringOfLightsBonusGameAnimPort.renderable = !this.stringOfLightsBonusGameAnim.renderable;
            this.stringOfLightsBonusGameAnimPort.visible = !this.stringOfLightsBonusGameAnim.visible;
        } else {
            this.stringOfLightsBonusGameAnim.renderable = false;
            this.stringOfLightsBonusGameAnimPort.renderable = false;
            this.stringOfLightsBonusGameAnim.visible = false;
            this.stringOfLightsBonusGameAnimPort.visible = false;
        }
    }

    protected async showLogo(): Promise<void> {
        if (!iwProps.marketingScreenOff) {
            this.bgBaseGameLogoAnim.visible = false;
        } else {
            this.bgBaseGameLogoAnim.visible = true;
        }
    }

    private playBonusStringOfLightsAnimation(): void {
        this.stringOfLightsBonusGameAnim.updateTransform();
        this.stringOfLightsBonusGameAnimPort.updateTransform();
        this.stringOfLightsBonusGameAnim.setAnimation(BackgroundSwap.STRINGS_BONUS_WIN_LAN, undefined, false);
        this.stringOfLightsBonusGameAnimPort.setAnimation(BackgroundSwap.STRINGS_BONUS_WIN_POT, undefined, false);
        this.stringOfLightsBonusGameAnim.play();
        this.stringOfLightsBonusGameAnimPort.play();
    }

    private playBackgroundShineAnimation(): void {
        TweenMax.delayedCall(
            BackgroundSwap.DELAY_BONUS_BACKGROUND_LANDSCAPE + Math.random() * BackgroundSwap.RANDOM_TIME_STRINGS_LIGHTS,
            () => {
                this.bgBaseGameAnimLand.updateTransform();
                this.bgBaseGameAnimPort.updateTransform();
                this.bgBaseGameAnimLand.setAnimation("landscape animation background2", undefined, true);
                this.bgBaseGameAnimPort.setAnimation("portrait animation background2", undefined, true);
            },
        );
    }

    private startPlaytingStringsOfLightsAnimation(): void {
        if (gameStore.props.baseGameVisible === false) {
            this.playBonusStringOfLightsAnimation();
            //Only play the strings of lights animation if the base game is not visible
            TweenMax.delayedCall(
                BackgroundSwap.DELAY_BONUS_BACKGROUND_LANDSCAPE +
                    Math.random() * BackgroundSwap.RANDOM_TIME_STRINGS_LIGHTS,
                () => {
                    this.startPlaytingStringsOfLightsAnimation();
                },
            );
        }
    }
}
