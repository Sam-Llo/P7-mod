import { Command } from "playa-core";
import { SubGameCommands } from "playa-iw";

/**
 * SymbolsCollectionCommands
 */
export class SymbolsCollectionCommands extends SubGameCommands {
    [key: string]: (...pl) => Command;
}
