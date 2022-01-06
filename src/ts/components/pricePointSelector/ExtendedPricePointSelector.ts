import { Button } from "playa-core";
import { PricePointSelector, iwProps } from "playa-iw";

/**
 * Extended PricePointSelector
 */
export class ExtendedPricePointSelector extends PricePointSelector {
    /**
     * Enable +/- buttons based on wager
     */
    protected enableButtons(): void {
        const index = iwProps.availableWagers.indexOf(iwProps.wager);
        const totalCosts = iwProps.availableWagers.length;
        this.enableOrDisableButton(this.plusButton, index < totalCosts - 1);
        this.enableOrDisableButton(this.minusButton, index > 0);
    }

    /**
     * Disable
     */
    public disable(): void {
        this.enableOrDisableButton(this.plusButton, false);
        this.enableOrDisableButton(this.minusButton, false);
        this.pricePointSelectorButton.enabled = false;
    }

    /**
     * Enable or Disable Button
     * @param button
     * @param show
     */
    private enableOrDisableButton(button: Button, show: boolean): void {
        // Set enabled property
        button.enabled = show;
    }
}
