import { Command, ICommand } from "playa-core";
import { GameUIControls } from "../GameUIControls";

/**
 * BuyButtonHighlightCommand
 */
export class BuyButtonHighlightCommand extends Command implements ICommand {
    public static readonly COMMAND_NAME: string = "buyButtonHighlightCommand";

    public view: GameUIControls;

    private _show: boolean;

    public constructor(payload: any, uiControls: GameUIControls, show: boolean) {
        super(payload);
        this.view = uiControls;
        this._show = show;
    }

    public execute(): void {
        super.execute();
        this.view.buyButtonHighlight(this._show);
        this.resolveCompleted();
    }
}
