import { Command, ICommand } from "playa-core";
import { gameStore } from "../..";
import { GamePayTable } from "../GamePayTable";

/**
 * ReelLandingCommand
 */
export class InitialSymbolSelectionReelSnapToSymbolCommand extends Command implements ICommand {
    private _gamePaytable: GamePayTable;

    constructor(views: { gamePaytable: GamePayTable }) {
        super([views]);
        this._gamePaytable = views.gamePaytable;
    }

    execute() {
        super.execute();
        this._gamePaytable.setLandingSymbolWithoutSpin(gameStore.props.initialSymbol);
        this.resolveCompleted();
    }
}
