import { BaseView, ParentDef, LayoutBuilder } from "playa-core";
import { IBasicPlaque } from "./IBasicPlaque";
import { CommandSet } from "./CommandSet";

/**
 * BasicPlaque class export
 * We need to extend BaseView as this is how we access the container
 */
export class BasicPlaque<PP, C extends CommandSet = null | null> extends BaseView<PP, any, any, C>
    implements IBasicPlaque {
    // Constructor
    public constructor(parent: ParentDef<PP, null>, commands: C | undefined, assetsIds: string[], layoutId: string) {
        // It's a derived class as we've extended BaseView, so call super()
        super(parent, {}, commands, assetsIds, layoutId);
    }

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

    public show(): void {
        // This could not be simpler, just show the container
        this.container.visible = true;
    }

    public hide(): void {
        // This could not be simpler, just hide the container
        this.container.visible = false;
    }
}
