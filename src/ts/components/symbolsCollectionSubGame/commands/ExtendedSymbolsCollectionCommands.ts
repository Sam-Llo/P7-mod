import { Command } from "playa-core";
import { SymbolsCollectionCommands } from "../../symbolsCollectionComponent/commands/SymbolsCollectionCommands";
import { SymbolsCollectionSubGame } from "../SymbolsCollectionSubGame";
import { ClearTurnDataCommand } from "./ClearTurnDataCommand";

/**
 * ExtendedSymbolsCollectionCommands
 */
export class ExtendedSymbolsCollectionCommands extends SymbolsCollectionCommands {
    [key: string]: (...pl) => Command;

    public clearTurnDataCommand: () => ClearTurnDataCommand;

    public constructor(knm: SymbolsCollectionSubGame) {
        super(knm);

        this.clearTurnDataCommand = () => new ClearTurnDataCommand(knm);
    }
}
