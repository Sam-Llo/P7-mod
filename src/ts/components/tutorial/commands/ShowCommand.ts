import { Command, ICommand, cecEventService } from "playa-core";
import { Tutorial } from "../Tutorial";
/**
 * Show command
 */
export class ShowCommand extends Command implements ICommand {
    private _show: boolean;

    private _tutorialComponent: Tutorial;

    constructor(views: { tutorialComponent: Tutorial }, show: boolean) {
        super([views]);
        this._show = show;
        this._tutorialComponent = views.tutorialComponent;
    }

    execute() {
        super.execute();
        this._tutorialComponent.container.visible = true;
        cecEventService.dispatchCECTutorialEvent(Tutorial.TUTORIAL_OPEN);

        this.resolveCompleted();
    }
}
