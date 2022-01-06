import { Command, ICommand } from "playa-core";
import { gameStore } from "../..";
import { GamePayTable } from "../GamePayTable";

/**
 * Start Snow Command
 */
export class InitialSymbolSelectionReelResetCommand extends Command implements ICommand {
    private _gamePaytable: GamePayTable;

    constructor(views: { gamePaytable: GamePayTable }) {
        super([views]);
        this._gamePaytable = views.gamePaytable;
    }

    execute() {
        super.execute();
        // alert("reset initlll");
        this._gamePaytable.resetAndSpinForever();
        this.resolveCompleted();
    }
}
