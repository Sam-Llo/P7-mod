import { Command, ICommand } from "playa-core";
import { GameUIControls } from "../GameUIControls";

/**
 * CustomPositioningCommand
 */
export class CustomPositioningCommand extends Command implements ICommand {
    public static readonly COMMAND_NAME: string = "uiCustomPositioningCommand";

    public view: GameUIControls;

    public constructor(payload: any, view: GameUIControls) {
        super(payload);
        this.view = view;
    }

    public execute(): void {
        super.execute();
        this.view.setCustomPositioning();
        this.resolveCompleted();
    }
}
