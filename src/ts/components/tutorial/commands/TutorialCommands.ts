import { Command } from "playa-core";
import { Tutorial } from "../Tutorial";
import { ShowCommand } from "./ShowCommand";
import { HideCommand } from "./HideCommand";
import { TutorialCloseCommand } from "./TutorialCloseCommand";

/**
 * Tutorial commands
 */
export class TutorialCommands {
    [key: string]: (...pl) => Command;

    public showCommand: () => ShowCommand;

    public hideCommand: () => HideCommand;

    public tutorialCloseCommand: (pl, view?: Tutorial) => TutorialCloseCommand;

    public constructor(tutorialComponent: Tutorial) {
        const views = {
            tutorialComponent,
        };

        this.showCommand = () => new ShowCommand(views, true);
        this.hideCommand = () => new HideCommand(views, false);
        this.tutorialCloseCommand = (pl, view?: Tutorial) => new TutorialCloseCommand(pl, tutorialComponent);
    }
}
