import { MobxUtils, systemProps, Orientation } from "playa-core";
import { RevealAllComponent } from "playa-iw";
import { gameStore } from "..";

/**
 * Reveal All Settings
 * @extends RevealAllComponent
 */
export class RevealAllSettings extends RevealAllComponent {
    private static readonly orientationChanged: string = "revealAllOrientationChanged";

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
            this.orientationChanged();
        }
    }

    /**
     * customPositioning object, each orientation is an object, pattern:
     * x - x position (current used if null)
     * y - y position (current used if null)
     * Shifting the position of the overall container in this situation
     */
    private customPositioning: object = {
        landscape: [{ x: 140, y: null }],
        portrait: [{ x: 256, y: null }],
    };

    /**
     * orientationChanged
     */
    private orientationChanged(): void {
        const reactionName: string = MobxUtils.getInstance().addReaction(
            RevealAllSettings.orientationChanged,
            () => systemProps.orientation,
            (orientation: Orientation) => {
                const orStr: string = orientation === Orientation.LANDSCAPE ? "landscape" : "portrait";
                this.customPositioning[orStr].forEach((obj) => {
                    const { x, y } = obj;
                    const xPos: number = x || this.container.x;
                    const yPos: number = y || this.container.y;
                    this.container.position.set(xPos, yPos);
                });
            },
            { fireImmediately: true },
        );
    }
}
