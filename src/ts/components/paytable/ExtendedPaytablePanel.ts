import { PaytablePanel, TicketPanel } from "playa-iw";
import { ExtendedPrizeTable } from "./ExtendedPrizeTable";

/**
 * @export
 * @class ExtendedPaytablePanel
 * @extends {PaytablePanel}
 */
export class ExtendedPaytablePanel extends PaytablePanel {
    public constructor() {
        super();
        this._controls = [
            new TicketPanel(this, this.getSkinCodeInfo()),
            new ExtendedPrizeTable(this, this.getSkinCodeInfo()),
        ];
    }
}
