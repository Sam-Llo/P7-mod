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

    private static readonly MINIMUN_GAP_TIME_STRINGS_LIGHTS: number = 1.5;

    private static readonly RANDOM_TIME_STRINGS_LIGHTS: number = 2;

    //Animated Lanscape background
    private bgBaseGameAnimLand!: SpineAnimation;

    //Animated Potrait background
    private bgBaseGameAnimPort!: SpineAnimation;

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

        //Find the portrai and landscape animated background inside Layout
        this.bgBaseGameAnimLand = this.container.children.find(
            (obj) => obj.name === "backGround_anim",
        ) as SpineAnimation;
        LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this.bgBaseGameAnimLand,
            "non Trans/logo",
            "non Trans/logo",
            loaderService.fromCache("beachyBonusWithSurfboardLogo"),
        );
        this.bgBaseGameAnimPort = this.container.children.find(
            (obj) => obj.name === "backGround_anim_prt",
        ) as SpineAnimation;
        LayoutUtils.getInstance().changeSpineTextureWihDifferentTexture(
            this.bgBaseGameAnimPort,
            "non Trans/logo",
            "non Trans/logo",
            loaderService.fromCache("beachyBonusWithSurfboardLogo"),
        );
        this.stringOfLightsBonusGameAnim = this.container.children.find(
            (obj) => obj.name === "stringOfLightsBonus_anim",
        ) as SpineAnimation;

        this.stringOfLightsBonusGameAnimPort = this.container.children.find(
            (obj) => obj.name === "stringOfLightsBonus_anim_prt",
        ) as SpineAnimation;

        this.bgBaseGameAnimLand.updateTransform();
        this.bgBaseGameAnimPort.updateTransform();

        this.bgBaseGameAnimLand.setAnimation("Landscape", undefined, true);
        this.bgBaseGameAnimPort.setAnimation("Portrait", undefined, true);
        this.bgBaseGameAnimLand.play();
        this.bgBaseGameAnimPort.play();
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
                    this.bgBaseGameAnimLand.setAnimation("LandscapeBonus", undefined, true);
                    this.bgBaseGameAnimPort.setAnimation("PortraitBonus", undefined, true);
                    this.bgBaseGameAnimLand.play();
                    this.bgBaseGameAnimPort.play();
                } else {
                    this.bgBaseGameAnimLand.updateTransform();
                    this.bgBaseGameAnimPort.updateTransform();
                    this.bgBaseGameAnimLand.setAnimation("Landscape", undefined, true);
                    this.bgBaseGameAnimPort.setAnimation("Portrait", undefined, true);
                    this.bgBaseGameAnimLand.play();
                    this.bgBaseGameAnimPort.play();
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
                BackgroundSwap.MINIMUN_GAP_TIME_STRINGS_LIGHTS +
                    Math.random() * BackgroundSwap.RANDOM_TIME_STRINGS_LIGHTS,
                () => {
                    this.startPlaytingStringsOfLightsAnimation();
                },
            );
        }
    }
}
