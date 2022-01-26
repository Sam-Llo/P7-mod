import { TweenMax } from "gsap";
import {
    BaseView,
    LayoutBuilder,
    loaderService,
    MobxUtils,
    Orientation,
    ParentDef,
    SpineAnimation,
    systemProps,
} from "playa-core";
import { gameStore } from "..";
import { LayoutUtils } from "../utils/LayoutUtils";
/**
 * BackgroundSwap
 */
export class BackgroundSwap extends BaseView<any, null, any, null> {
    private static readonly orientationChanged: string = "backgroundOrientationChanged";

    private static readonly baseGameVisible: string = "symbolsCollectionBaseGameVisible";

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
    private bgBaseGameLogoAnim!: SpineAnimation;

    private stringOfLightsBonusGameAnim!: SpineAnimation;

    private stringOfLightsBonusGameAnimPort!: SpineAnimation;

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
        this.bgBaseGameLogoAnim.updateTransform();

        this.bgBaseGameAnimLand.setAnimation("landscape animation background", undefined, true);
        this.bgBaseGameAnimPort.setAnimation("portrait animation background", undefined, true);
        this.bgBaseGameLogoAnim.setAnimation("landscape logo animation", undefined, true);
        this.bgBaseGameLogoAnim.setAnimation("portrait logo animation", undefined, true);

        this.bgBaseGameAnimLand.play();
        this.bgBaseGameAnimPort.play();
        this.bgBaseGameLogoAnim.play();
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

                // setting logo animation depending on orientation
                if (systemProps.orientation === Orientation.LANDSCAPE) {
                    this.bgBaseGameLogoAnim.visible = systemProps.orientation === Orientation.LANDSCAPE;
                    this.bgBaseGameLogoAnim.setAnimation("landscape logo animation", undefined, true);
                    this.bgBaseGameLogoAnim.play();
                } else if (systemProps.orientation === Orientation.PORTRAIT) {
                    this.bgBaseGameLogoAnim.visible = systemProps.orientation === Orientation.PORTRAIT;
                    this.bgBaseGameLogoAnim.setAnimation("portrait logo animation", undefined, true);
                    this.bgBaseGameLogoAnim.play();
                }
            },
            { fireImmediately: true },
        );

        MobxUtils.getInstance().addReaction(
            BackgroundSwap.baseGameVisible,
            () => gameStore.props.baseGameVisible,
            (isBaseGameVisible: boolean) => {
                this.setStringOfLightsVisibilitiesBaseOnOrientation();
                this.startPlaytingStringsOfLightsAnimation();
                if (!isBaseGameVisible) {
                    this.bgBaseGameAnimLand.updateTransform();
                    this.bgBaseGameAnimPort.updateTransform();
                    this.bgBaseGameLogoAnim.visible = false;
                    TweenMax.delayedCall(BackgroundSwap.DELAY_BONUS_BACKGROUND_LANDSCAPE, () => {
                        this.bgBaseGameAnimLand.setAnimation("landscape bouns reveal background", undefined, false);
                        this.bgBaseGameAnimLand.play();

                        // this.bgBaseGameAnimPort.setAnimation("portrait bonus reveal background", undefined, false);
                        //this.bgBaseGameAnimPort.play();
                    });
                    TweenMax.delayedCall(BackgroundSwap.DELAY_BONUS_BACKGROUND_PORTRAIT, () => {
                        this.bgBaseGameAnimPort.setAnimation("portrait bonus reveal background", undefined, false);
                        this.bgBaseGameAnimPort.play();
                    });
                } else {
                    this.bgBaseGameAnimLand.updateTransform();
                    this.bgBaseGameAnimPort.updateTransform();
                    this.bgBaseGameAnimLand.setAnimation("landscape animation background", undefined, true);
                    this.bgBaseGameAnimPort.setAnimation("portrait animation background", undefined, true);
                    this.bgBaseGameAnimLand.play();
                    this.bgBaseGameAnimPort.play();
                    this.bgBaseGameLogoAnim.visible = true;
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

    private playBonusStringOfLightsAnimation(): void {
        this.stringOfLightsBonusGameAnim.updateTransform();
        this.stringOfLightsBonusGameAnimPort.updateTransform();
        this.stringOfLightsBonusGameAnim.setAnimation(BackgroundSwap.STRINGS_BONUS_WIN_LAN, undefined, false);
        this.stringOfLightsBonusGameAnimPort.setAnimation(BackgroundSwap.STRINGS_BONUS_WIN_POT, undefined, false);
        this.stringOfLightsBonusGameAnim.play();
        this.stringOfLightsBonusGameAnimPort.play();
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
