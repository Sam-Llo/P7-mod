import { Command, ICommand, Button } from "playa-core";
import { Tutorial } from "../Tutorial";

/**
 * Tutorial close command
 */
export class TutorialCloseCommand extends Command implements ICommand {
    public static readonly COMMAND_NAME: string = "tutorialCloseCommand";

    public reactionName: string;

    public view: Tutorial;

    public closeButton: any;

    public constructor(payload: any, view: Tutorial) {
        super(payload);
        this.view = view;
        this.closeButton = this.view.getCloseButton();
        this.reactionName = "";
    }

    public execute(): void {
        super.execute();

        if (this.closeButton) {
            this.closeButton.addListener("pointerup", this.handleButtonUp, this);
        }
    }

    protected handleButtonUp(): void {
        this.cancel();
    }

    public cancel(): void {
        this.closeButton.removeListener("pointerup", this.handleButtonUp, this);
        super.cancel();
    }
}
