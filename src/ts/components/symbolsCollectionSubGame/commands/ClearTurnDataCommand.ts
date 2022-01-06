import { Command, ICommand } from "playa-core";
import { SymbolsCollectionSubGame } from "../SymbolsCollectionSubGame";

/**
 * ClearTurnDataCommand
 */
export class ClearTurnDataCommand extends Command implements ICommand {
    public static readonly COMMAND_NAME: string = "keyNumberMatchClearTurnDataCommand";

    private _view: SymbolsCollectionSubGame;

    public constructor(knm: SymbolsCollectionSubGame) {
        super(knm);
        this._view = knm;
    }

    public execute(): void {
        super.execute();
        this._view.clearTurnData();
        this.resolveCompleted();
    }
}
