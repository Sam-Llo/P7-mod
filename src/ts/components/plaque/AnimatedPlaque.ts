import { ParentDef, LayoutBuilder } from "playa-core";
import { TweenMax } from "gsap";
import { CommandSet } from "./CommandSet";
import { BasicPlaque } from "./BasicPlaque";

/**
 * AnimatedPlaque class export
 * We need to extend BasicPlaque as this what we're basing it on
 */
export class AnimatedPlaque<PP, C extends CommandSet = null | null> extends BasicPlaque<PP, C> {
    // Set up some variables for the tween
    private tween: any;

    private animProps: any;

    // Constructor
    /*public constructor(parent: ParentDef<PP, null>, commands: C | undefined, assetsIds: string[], layoutId: string) {
        // It's a derived class as we've extended BasicPlaque, so call super()
        super(parent, commands, assetsIds, layoutId);
    }*/

    // Init promise
    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build the layout, it's only a basic plaque so there shouldn't be much to actually build
        LayoutBuilder.build(this.layout, new Map(), this.container);

        // The container is accessible now, so bring to front and visible false
        this.container.zIndex = 9999;
        this.container.visible = false;
    }

    public setProps(props): void {
        this.animProps = props;
    }

    public show(): void {
        this.tween = new TweenMax(this.container, this.animProps.duration || 0, {
            [this.animProps.prop]: this.animProps.showTarget,
            onStart: () => {
                super.show();
            },
        });
    }

    public hide(): void {
        this.tween = new TweenMax(this.container, this.animProps.duration || 0, {
            [this.animProps.prop]: this.animProps.hideTarget,
            onComplete: () => {
                super.hide();
            },
        });
    }
}
