import { Command, ICommand } from "playa-core";
import { GameUIControls } from "../GameUIControls";
import { PlayTicketButtonComponent } from "../buttons/PlayTicketButtonComponent";

/**
 * PlayTicketCommand
 */
export class PlayTicketCommand extends Command implements ICommand {
    public static readonly COMMAND_NAME: string = "uiPlayTicketCommand";

    public view: GameUIControls;

    public playTicketButton: PlayTicketButtonComponent;

    public constructor(payload: any, view: GameUIControls) {
        super(payload);
        this.view = view;
        this.playTicketButton = this.view.getControl(GameUIControls.BTN_PLAY);
    }

    public execute(): void {
        super.execute();
        this.playTicketButton.removeAllListeners("pointerup");
        this.playTicketButton.addListener("pointerup", this.handleButtonUp, this);
    }

    protected handleButtonUp(): void {
        this.resolveCompleted();
    }

    public cancel(): void {
        this.playTicketButton.removeListener("pointerup", this.handleButtonUp, this);
        super.cancel();
    }
}
