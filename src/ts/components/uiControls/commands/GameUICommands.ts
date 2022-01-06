import { Command } from "playa-core";
import { UIControlsCommands } from "playa-iw";
import { GameUIControls } from "../GameUIControls";
import { PlayTicketCommand } from "./PlayTicketCommand";
import { CustomPositioningCommand } from "./CustomPositioningCommand";
import { HideUIControlCommand } from "./HideUIControlCommand";
import { BuyButtonHighlightCommand } from "./BuyButtonHighlightCommand";

/**
 * GameUICommands commands
 */
export class GameUICommands extends UIControlsCommands {
    [key: string]: (...pl) => Command;

    public playTicketCommand: () => PlayTicketCommand;

    public customPositioningCommand: () => CustomPositioningCommand;

    public hideUIControlCommand: (ids: string[], show: boolean, delay?: number) => HideUIControlCommand;

    public buyButtonHighlightCommand: (highlight: boolean) => BuyButtonHighlightCommand;

    public constructor(uiControls: GameUIControls) {
        super(uiControls);
        this.playTicketCommand = () => new PlayTicketCommand(null, uiControls);
        this.customPositioningCommand = () => new CustomPositioningCommand(null, uiControls);
        this.hideUIControlCommand = (ids: string[], show: boolean, delay: number = 0) =>
            new HideUIControlCommand(uiControls, ids, false, delay);
        this.buyButtonHighlightCommand = (highlight: boolean) =>
            new BuyButtonHighlightCommand(null, uiControls, highlight);
    }
}
