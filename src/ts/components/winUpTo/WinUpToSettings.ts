import { translationService, TextAutoFit, MobxUtils } from "playa-core";
import { WinUpToComponent, ITextFields, IStrings } from "playa-iw";
import { gameStore } from "../index";

/**
 * Win Up To component
 */
export class WinUpToSettings extends WinUpToComponent {
    // Array of text field names you need to use for the label (e.g. WIN UP TO), or a combined string (e.g. WIN UP TO $XXX)
    private LABEL_NAMES: string[] = ["winUpToIn_label", "winUpToOut_label"];

    // Array of text field names you need to use for the value
    private VALUE_NAMES: string[] = ["winUpToIn_value", "winUpToOut_value"];

    private static readonly baseGameVisible: string = "WinUpToSettingsBaseGameVisible";

    private _valueFields: TextAutoFit[] = [];

    private _labelFields: TextAutoFit[] = [];

    // Setup data
    private _setupData = {
        WIN_UP_TO_IN: "winUpToIn", // In container name
        WIN_UP_TO_OUT: "winUpToOut", // Out container name
        VALUE_PLACEHOLDER: "{0}", // String that will be replaced in the WIN UP TO message by the cash amount
        ALIGN_REGION_NAME: "winUpToCenterArea", // Name of region used to auto-align the message to
        AUTO_ALIGN_ENABLED: false, // Auto-align value within container when updated (usually if we have more than one field)
    };

    /**
     *
     */
    protected async init(): Promise<void> {
        // Store variable options
        // Defaults will be used if this is not called
        super.setup(this._setupData);

        // Proceed with init
        super.init();

        MobxUtils.getInstance().addReaction(
            WinUpToSettings.baseGameVisible,
            (): boolean => gameStore.props.baseGameVisible,
            (visible: boolean) => {
                this.container.visible = visible;
            },
            { fireImmediately: false },
        );
    }

    /**
     * registerTextFieldsAndStrings
     */
    protected registerTextFieldsAndStrings(): void {
        // Register text fields
        // Layout must be built first
        super.registerTextFields(this.findTextFields());

        // Set the properties for the strings and text fields
        // Label is compulsory (for single line WIN UP TO XXXX), value is optional for when we need the value in a separate field
        super.registerStrings(this.findStrings());
    }

    /**
     * Find strings for label and value - value is optional
     */
    private findStrings(): IStrings {
        return {
            label: translationService.getString("Game.winUpTo.winUpToText") || "",
            value: translationService.getString("Game.winUpTo.winUpToValue") || "",
        };
    }

    /**
     * Align fields within container
     * @override override base class's populate method, since we want to have win up to and xxx,xxx as one line
     */
    protected populate(): void {
        super.populate();

        this._valueFields.forEach((element) => {
            const originalText = element.text;
            element.text = `WIN UP TO ${originalText}`;
        });
        this._labelFields.forEach((element) => {
            element.renderable = false;
        });
    }

    /**
     * Search through winUpTo container and identify any text fields to populate with the label (typically WIN UP TO)
     * And the value (if applicable, if there is no value field it will use the label field
     */
    private findTextFields(): ITextFields {
        const allChildren: any[] = [];

        // Look through the container and construct an array of all children
        this.container.children.forEach((obj: any) => {
            if (obj && obj.children) {
                allChildren.push(obj);
                obj.children.forEach((obj2) => {
                    allChildren.push(obj2);
                });
            }
        });

        // Look through the array of all children and identify all needed text fields
        allChildren.forEach((obj: any) => {
            if (obj.name && this.LABEL_NAMES.includes(obj.name)) {
                this._labelFields.push(obj);
            }

            if (obj.name && this.VALUE_NAMES.includes(obj.name)) {
                this._valueFields.push(obj);
            }
        });

        // Register text fields
        // Label compulsory, Value optional, as you may want to use a single text field, or two, depending on how
        // the 'WIN UP TO' string and the value need to be formatted
        return {
            label: this._labelFields,
            value: this._valueFields,
        };
    }

    /**
     * Populate the necessary fields
     * Under normal circumstances the component uses the fields you have registered
     * This overrides this should you need to
     * To get the top prize call this.getTopPrize()
     */
    //protected populate(): void {}

    /**
     * Align fields within container
     * This is set up so that you can specify a region using a shape in the layout tool
     * You can override this in this function by defining a region yourself using co-ordinates
     * You will need to detect orientation and have a separate region for each orientation
     * You can also position text fields to your choosing
     * Basically - if you want to reposition or align text above and beyond what the component does... do it here
     */
    //protected autoAlign(): void {}

    /**
     * Draw attention to the updated prize value
     * Price point to allow different behaviour for increasing or decreasing the price point
     * To access external config file, reference this.assets.get(WinUpToComponent.configName).WinUpTo
     * @param increase
     */
    //protected presentUpdate(increase: boolean): void {}
}
