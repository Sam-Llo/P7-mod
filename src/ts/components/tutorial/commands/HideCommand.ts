import { Command, ICommand, cecEventService } from "playa-core";
import { Tutorial } from "../Tutorial";
/**
 * Show command
 */
export class HideCommand extends Command implements ICommand {
    private _show: boolean;

    private _tutorialComponent: Tutorial;

    constructor(views: { tutorialComponent: Tutorial }, show: boolean) {
        super([views]);
        this._show = show;
        this._tutorialComponent = views.tutorialComponent;
    }

    execute() {
        super.execute();
        this._tutorialComponent.container.visible = false;
        cecEventService.dispatchCECTutorialEvent(Tutorial.TUTORIAL_CLOSE);

        this.resolveCompleted();
    }
}
