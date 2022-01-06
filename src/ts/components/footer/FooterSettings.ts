import { FooterBar, IMeterPositions } from "playa-iw";

/**
 * FooterBar extension
 */
export class FooterSettings extends FooterBar {
    // Default positions for meters when balance is not visible
    // This is usually TRY mode OR if an operator chooses not to display the balance in BUY mode
    private METER_POSITIONS_NO_BALANCE: IMeterPositions = {
        landscape: {
            ticketCost: { x: 360, y: 13 },
            win: { x: 1080, y: 13 },
        },
        portrait: {
            ticketCost: { x: 202, y: 0 },
            win: { x: 608, y: 0 },
        },
    };

    // Default positions for meters when balance is visible
    private METER_POSITIONS_BALANCE: IMeterPositions = {
        landscape: {
            balance: { x: 240, y: 13 },
            ticketCost: { x: 720, y: 13 },
            win: { x: 1200, y: 13 },
        },
        portrait: {
            balance: { x: 135, y: 0 },
            ticketCost: { x: 405, y: 0 },
            win: { x: 675, y: 0 },
        },
    };

    // Gap between meters when aligned in landscape, default is 10
    private METER_GAP: number = 10;

    /**
     *
     */
    protected async init(): Promise<void> {
        // Store variable options
        // Defaults will be used if this is not called
        super.setMeterPositions({
            balance: this.METER_POSITIONS_BALANCE,
            noBalance: this.METER_POSITIONS_NO_BALANCE,
        });

        // Set gap between meters, landscape only, default used if not called
        super.setMeterGap(this.METER_GAP);

        // Init
        super.init();
    }
}
