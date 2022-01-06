import { Command, ICommand, soundManager } from "playa-core";
import { iwProps } from "playa-iw";
import { gameStore } from "../..";
import { IOnCompleteCallbacks } from "../../lockAndReelBonusSubGame/components/IOnCompleteCallbacks";
import { GamePayTable } from "../GamePayTable";

/**
 * ReelLandingCommand
 */
export class InitialSymbolSelectionReelLandingCommand extends Command implements ICommand, IOnCompleteCallbacks {
    private _gamePaytable: GamePayTable;

    constructor(views: { gamePaytable: GamePayTable }) {
        super([views]);
        this._gamePaytable = views.gamePaytable;
    }

    onComplete(): void {
        this._gamePaytable.playGlowAnimation();
        this.resolveCompleted();
    }

    execute() {
        super.execute();
        //no spin sfx for base game symbol select box for now
        // soundManager.execute("onSymbolSpin");
        this._gamePaytable.land(gameStore.props.initialSymbol, this);
    }
}
