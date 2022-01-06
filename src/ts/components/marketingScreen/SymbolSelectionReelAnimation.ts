import { PausableReel } from "../lockAndReelBonusSubGame/components/PausableReel";

/**
 * SymbolSelectionReelAnimation
 */
export class SymbolSelectionReelAnimation extends PausableReel {
    protected setUpSymbolsTextureNameMap(): void {
        this._symbolsTextureNameMap = new Map<string, string>();
        this._symbolsTextureNameMap.set("A", "palmTree");
        this._symbolsTextureNameMap.set("B", "sun");
        this._symbolsTextureNameMap.set("C", "iceCream");
        this._symbolsTextureNameMap.set("D", "starFish");
    }

    presentWin(): void {}

    onComplete(): void {}
}
