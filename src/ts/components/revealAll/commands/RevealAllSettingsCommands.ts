import { Command } from "playa-core";
import { RevealAllCommands, AutoBuyRevealAllCommand } from "playa-iw";
import { RevealAllSettings } from "../RevealAllSettings";
import { CustomPositioningCommand } from "./CustomPositioningCommand";

/**
 * RevealAllSettingsCommands commands
 */
export class RevealAllSettingsCommands extends RevealAllCommands {
    [key: string]: (...pl) => Command;

    public customPositioningCommand: () => CustomPositioningCommand;

    public autoBuyRevealAllCommand: () => AutoBuyRevealAllCommand;

    public constructor(revealAllComponent: RevealAllSettings) {
        super(revealAllComponent);
        this.customPositioningCommand = () => new CustomPositioningCommand(null, revealAllComponent);
        this.autoBuyRevealAllCommand = () => new AutoBuyRevealAllCommand(null, revealAllComponent);
    }
}
