import { Command } from "playa-core";
import { SubGameCommands } from "playa-iw";

/**
 * LockAndReelBonusCommands commands
 */
export class LockAndReelBonusCommands extends SubGameCommands {
    [key: string]: (...pl) => Command;
}
