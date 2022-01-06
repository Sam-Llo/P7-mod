import { Command } from "playa-core";
import { GamePayTable } from "../GamePayTable";
import { InitialSymbolSelectionReelLandingCommand } from "./InitialSymbolSelectionReelLandingCommand";
import { InitialSymbolSelectionReelResetCommand } from "./InitialSymbolSelectionReelResetCommand";
import { InitialSymbolSelectionReelSnapToSymbolCommand } from "./InitialSymbolSelectionReelSnapToSymbolCommand";

/**
 * RevealAllSettingsCommands commands
 */
export class InitialSymbolSelectionReelCommands {
    [key: string]: (...pl) => Command;

    public initialSymbolSelectionReelLandingCommand: () => InitialSymbolSelectionReelLandingCommand;

    public initialSymbolSelectionReelResetCommand: () => InitialSymbolSelectionReelResetCommand;

    public initialSymbolSelectionReelSnapToSymbolCommand: () => InitialSymbolSelectionReelSnapToSymbolCommand;

    public constructor(gamePaytable: GamePayTable) {
        const views = {
            gamePaytable,
        };
        this.initialSymbolSelectionReelLandingCommand = () => new InitialSymbolSelectionReelLandingCommand(views);
        this.initialSymbolSelectionReelResetCommand = () => new InitialSymbolSelectionReelResetCommand(views);
        this.initialSymbolSelectionReelSnapToSymbolCommand = () =>
            new InitialSymbolSelectionReelSnapToSymbolCommand(views);
    }
}
