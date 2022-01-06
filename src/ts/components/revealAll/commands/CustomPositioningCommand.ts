import { Command, ICommand } from "playa-core";
import { RevealAllSettings } from "../RevealAllSettings";

/**
 * CustomPositioningCommand
 */
export class CustomPositioningCommand extends Command implements ICommand {
    public static readonly COMMAND_NAME: string = "revealAllCustomPositioningCommand";

    public view: RevealAllSettings;

    public constructor(payload: any, view: RevealAllSettings) {
        super(payload);
        this.view = view;
    }

    public execute(): void {
        super.execute();
        this.view.setCustomPositioning();
        this.resolveCompleted();
    }
}
