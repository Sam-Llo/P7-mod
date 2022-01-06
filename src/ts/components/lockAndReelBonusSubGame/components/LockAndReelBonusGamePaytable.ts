import { TimelineMax } from "gsap";
import { Container } from "pixi.js";
import { currencyService, MobxUtils, SpineAnimation, TextAutoFit } from "playa-core";
import { iwProps } from "playa-iw";
import { LockAndReelBonusSubGame } from "../LockAndReelBonusSubGame";

/**
 * LockAndReelBonusGamePaytable
 */
export class LockAndReelBonusGamePaytable {
    private static originalTintColour = 0xffffff;

    private static highlightTintColour = 0xffff00;

    private _bonusPayTable: Container;

    private _bonusBoardWinSpineAnimation: SpineAnimation;

    private _lockandReelBonusSubGame: LockAndReelBonusSubGame;

    private _selectedBonusHighLightTimeLine;

    //Will need this to play zoom in effect
    private _currentHighlightedMultiplierNum: number;

    //Bonus Paytable texts
    private _bonusPaytableValueText16!: TextAutoFit;

    private _bonusPaytableFindText16!: TextAutoFit;

    private _bonusPaytableValueText15!: TextAutoFit;

    private _bonusPaytableFindText15!: TextAutoFit;

    private _bonusPaytableValueText14!: TextAutoFit;

    private _bonusPaytableFindText14!: TextAutoFit;

    private _bonusPaytableValueText13!: TextAutoFit;

    private _bonusPaytableFindText13!: TextAutoFit;

    private _bonusPaytableValueText12!: TextAutoFit;

    private _bonusPaytableFindText12!: TextAutoFit;

    private _bonusPaytableValueText11!: TextAutoFit;

    private _bonusPaytableFindText11!: TextAutoFit;

    private _bonusPaytableValueText10!: TextAutoFit;

    private _bonusPaytableFindText10!: TextAutoFit;

    private _bonusPaytableValueText9!: TextAutoFit;

    private _bonusPaytableFindText9!: TextAutoFit;

    private _bonusPaytableValueText8!: TextAutoFit;

    private _bonusPaytableFindText8!: TextAutoFit;

    private _bonusPaytableValueText7!: TextAutoFit;

    private _bonusPaytableFindText7!: TextAutoFit;

    private _bonusPaytableValueText6!: TextAutoFit;

    private _bonusPaytableFindText6!: TextAutoFit;

    private _bonusPaytableValueText5!: TextAutoFit;

    private _bonusPaytableFindText5!: TextAutoFit;

    private _paytableBonusMultiplierAnim5!: SpineAnimation;

    private _paytableBonusMultiplierAnim6!: SpineAnimation;

    private _paytableBonusMultiplierAnim7!: SpineAnimation;

    private _paytableBonusMultiplierAnim8!: SpineAnimation;

    private _paytableBonusMultiplierAnim9!: SpineAnimation;

    private _paytableBonusMultiplierAnim10!: SpineAnimation;

    private _paytableBonusMultiplierAnim11!: SpineAnimation;

    private _paytableBonusMultiplierAnim12!: SpineAnimation;

    private _paytableBonusMultiplierAnim13!: SpineAnimation;

    private _paytableBonusMultiplierAnim14!: SpineAnimation;

    private _paytableBonusMultiplierAnim15!: SpineAnimation;

    private _paytableBonusMultiplierAnim16!: SpineAnimation;

    constructor(bonusPayTable, lockandReelBonusSubGame: LockAndReelBonusSubGame) {
        this._bonusPayTable = bonusPayTable;
        this._bonusPayTable.renderable = false;
        this._lockandReelBonusSubGame = lockandReelBonusSubGame;

        this._bonusBoardWinSpineAnimation = this._bonusPayTable.children.find(
            (obj) => obj.name === "bonusBoardWinSpineAnimation",
        ) as SpineAnimation;
        this._currentHighlightedMultiplierNum = 0;
        this._bonusBoardWinSpineAnimation.updateTransform();
        this._bonusBoardWinSpineAnimation.setAnimation(
            this._lockandReelBonusSubGame.getConfig().WinningAnimations.BonusBoardLoop,
            undefined,
            true,
        );
        this._bonusBoardWinSpineAnimation.play();

        this.findPaytableElements();

        this.addReaction();
    }

    private findPaytableElements() {
        this.findPaytableBonusElementsForMultiplier(5);
        this.findPaytableBonusElementsForMultiplier(6);
        this.findPaytableBonusElementsForMultiplier(7);
        this.findPaytableBonusElementsForMultiplier(8);
        this.findPaytableBonusElementsForMultiplier(9);
        this.findPaytableBonusElementsForMultiplier(10);
        this.findPaytableBonusElementsForMultiplier(11);
        this.findPaytableBonusElementsForMultiplier(12);
        this.findPaytableBonusElementsForMultiplier(13);
        this.findPaytableBonusElementsForMultiplier(14);
        this.findPaytableBonusElementsForMultiplier(15);
        this.findPaytableBonusElementsForMultiplier(16);
    }

    private findPaytableBonusElementsForMultiplier(num: number) {
        const paytableBonusMultiplier = this._bonusPayTable.children.find(
            (obj) => obj.name === `paytableBonus_multiplier${num}`,
        ) as Container;
        this[
            `${this._lockandReelBonusSubGame.getConfig().PaytableBonusMultiplierAnimNamePrefix}${num}`
        ] = paytableBonusMultiplier.children.find((obj) =>
            obj.name.includes("paytableBonus_multiplier_anim"),
        ) as SpineAnimation;
        this[
            `${this._lockandReelBonusSubGame.getConfig().PaytableBonusMultiplierAnimNamePrefix}${num}`
        ].updateTransform();
        this[`${this._lockandReelBonusSubGame.getConfig().PaytableBonusMultiplierAnimNamePrefix}${num}`].setAnimation(
            this._lockandReelBonusSubGame.getConfig().PaytableHighlightSparkleAnimationName,
            undefined,
            false,
        );
        this[`${this._lockandReelBonusSubGame.getConfig().PaytableBonusMultiplierAnimNamePrefix}${num}`].play();
        this[
            `${this._lockandReelBonusSubGame.getConfig().BonusPaytableFindTextPrefix}${num}`
        ] = paytableBonusMultiplier.children.find((obj) =>
            obj.name.includes("paytableBonus_multiplier_counter"),
        ) as TextAutoFit;

        this[
            `${this._lockandReelBonusSubGame.getConfig().BonusPaytableValueTextPrefix}${num}`
        ] = paytableBonusMultiplier.children.find((obj) =>
            obj.name.includes("paytableBonus_multiplierAmount_value"),
        ) as TextAutoFit;
    }

    public show(isShow: boolean): void {
        this._bonusPayTable.renderable = isShow;

        if (!isShow) {
            if (this.isWin()) {
                this[
                    `${
                        this._lockandReelBonusSubGame.getConfig().BonusPaytableFindTextPrefix
                    }${this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount()}`
                ].tint = LockAndReelBonusGamePaytable.originalTintColour;
                this[
                    `${
                        this._lockandReelBonusSubGame.getConfig().BonusPaytableValueTextPrefix
                    }${this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount()}`
                ].tint = LockAndReelBonusGamePaytable.originalTintColour;
                this._lockandReelBonusSubGame.setCurrentFoundDrinkSymbolCount(0);
            }
        }
    }

    public playBonusWinSpineAnimation() {
        this._bonusBoardWinSpineAnimation.updateTransform();
        this._bonusBoardWinSpineAnimation.setAnimation(
            this._lockandReelBonusSubGame.getConfig().WinningAnimations.BonusBoardWin,
            undefined,
            false,
        );
        this._bonusBoardWinSpineAnimation.addAnimation(
            this._lockandReelBonusSubGame.getConfig().WinningAnimations.BonusBoardLoop,
            undefined,
            true,
        );
        this._bonusBoardWinSpineAnimation.play();
    }

    private addReaction(): void {
        //Set up the pay table in game one time and set reaction with wager
        MobxUtils.getInstance().addReaction(
            "gamePayTable_reset",
            () => iwProps.wager,
            () => {
                this.setUpPayTable();
            },
            { fireImmediately: true },
        );
    }

    /*
     * Setup pay table
     * Change how much each rewards count worth based on wager amount
     */
    public setUpPayTable() {
        //Interate from max rewards to the least rewards
        for (
            let i = this._lockandReelBonusSubGame.getConfig().GameOptions.BonusGridElements;
            i >= this._lockandReelBonusSubGame.getConfig().GameOptions.LeastWinningCount;
            i--
        ) {
            const value = iwProps.prizeTable.get(`B${i}`) || 0;
            this[
                `${this._lockandReelBonusSubGame.getConfig().BonusPaytableValueTextPrefix}${i}`
            ].text = currencyService.format(value, iwProps.denomination);
        }
    }

    public isWin(): boolean {
        return (
            this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount() >=
            this._lockandReelBonusSubGame.getConfig().GameOptions.LeastWinningCount
        );
    }

    private async turnCurrentlyHighlightedWinningNumbersToNormalColour() {
        await new Promise<void>((resolve) => {
            const timeline = new TimelineMax({
                onComplete: () => {
                    resolve();
                },
            });
            const findText = this[
                `${this._lockandReelBonusSubGame.getConfig().BonusPaytableFindTextPrefix}${
                    this._currentHighlightedMultiplierNum
                }`
            ];
            const valueText = this[
                `${this._lockandReelBonusSubGame.getConfig().BonusPaytableValueTextPrefix}${
                    this._currentHighlightedMultiplierNum
                }`
            ];
            //change back to normal colour
            timeline.fromTo(
                [findText, valueText],
                this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                { tint: LockAndReelBonusGamePaytable.highlightTintColour },
                { tint: LockAndReelBonusGamePaytable.originalTintColour },
                "0",
            );
        });
    }

    private async highlightCurrentWinningAmountTexts() {
        await new Promise<void>((resolve) => {
            const findText = this[
                `${
                    this._lockandReelBonusSubGame.getConfig().BonusPaytableFindTextPrefix
                }${this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount()}`
            ];
            const valueText = this[
                `${
                    this._lockandReelBonusSubGame.getConfig().BonusPaytableValueTextPrefix
                }${this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount()}`
            ];
            const highlightAnim = this[
                `${
                    this._lockandReelBonusSubGame.getConfig().PaytableBonusMultiplierAnimNamePrefix
                }${this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount()}`
            ];

            highlightAnim.updateTransform();
            highlightAnim.setAnimation(
                this._lockandReelBonusSubGame.getConfig().PaytableHighlightSparkleAnimationName,
                undefined,
                false,
            );
            highlightAnim.play();

            this._selectedBonusHighLightTimeLine = new TimelineMax({
                onComplete: () => {
                    resolve();
                },
            });
            this._selectedBonusHighLightTimeLine.fromTo(
                [findText.scale, valueText.scale],
                this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                { x: 1, y: 1 },
                {
                    x: this._lockandReelBonusSubGame.getConfig().PulseAmount,
                    y: this._lockandReelBonusSubGame.getConfig().PulseAmount,
                    yoyo: true,
                    repeat: 3,
                },
                "0",
            );
            this._selectedBonusHighLightTimeLine.fromTo(
                [findText, valueText],
                this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                { tint: LockAndReelBonusGamePaytable.originalTintColour },
                { tint: LockAndReelBonusGamePaytable.highlightTintColour, yoyo: true, repeat: 4 },
                "0",
            );
        });
    }

    public reset(): void {
        this._currentHighlightedMultiplierNum = 0;
    }

    private async highlightTransitionWinningAmounts(startingIndex: number) {
        for (let i = startingIndex; i < this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount(); i++) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise<void>((resolve) => {
                const timeline = new TimelineMax({
                    onComplete: () => {
                        resolve();
                    },
                });
                const findText = this[`${this._lockandReelBonusSubGame.getConfig().BonusPaytableFindTextPrefix}${i}`];
                const valueText = this[`${this._lockandReelBonusSubGame.getConfig().BonusPaytableValueTextPrefix}${i}`];

                const highlightAnim = this[
                    `${this._lockandReelBonusSubGame.getConfig().PaytableBonusMultiplierAnimNamePrefix}${i}`
                ];
                highlightAnim.updateTransform();
                highlightAnim.setAnimation(
                    this._lockandReelBonusSubGame.getConfig().PaytableHighlightSparkleAnimationName,
                    undefined,
                    false,
                );
                highlightAnim.play();
                //change to highlight colour
                timeline.fromTo(
                    [findText, valueText],
                    this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                    { tint: LockAndReelBonusGamePaytable.originalTintColour },
                    { tint: LockAndReelBonusGamePaytable.highlightTintColour },
                    "0",
                );
                //scale up
                timeline.fromTo(
                    [findText.scale, valueText.scale],
                    this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                    { x: 1, y: 1 },
                    {
                        x: this._lockandReelBonusSubGame.getConfig().PulseAmount,
                        y: this._lockandReelBonusSubGame.getConfig().PulseAmount,
                    },
                    "0",
                );
                //change back to normal colour
                timeline.fromTo(
                    [findText, valueText],
                    this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                    { tint: LockAndReelBonusGamePaytable.highlightTintColour },
                    { tint: LockAndReelBonusGamePaytable.originalTintColour },
                    `<${this._lockandReelBonusSubGame.getConfig().PulseAnimationLength}`,
                );
                //scale back to normal size
                timeline.fromTo(
                    [findText.scale, valueText.scale],
                    this._lockandReelBonusSubGame.getConfig().PulseAnimationLength,
                    {
                        x: this._lockandReelBonusSubGame.getConfig().PulseAmount,
                        y: this._lockandReelBonusSubGame.getConfig().PulseAmount,
                    },
                    { x: 1, y: 1 },
                    `<${this._lockandReelBonusSubGame.getConfig().PulseAnimationLength}`,
                );
            });
        }
    }

    public async highlightCurrentWinMultiplier(): Promise<void> {
        let isFirstTime = false;
        if (
            this._currentHighlightedMultiplierNum <
            this._lockandReelBonusSubGame.getConfig().GameOptions.LeastWinningCount
        ) {
            this._currentHighlightedMultiplierNum = this._lockandReelBonusSubGame.getConfig().GameOptions.LeastWinningCount;
            isFirstTime = true;
        }

        if (this._selectedBonusHighLightTimeLine) {
            this._selectedBonusHighLightTimeLine.kill();
            this._selectedBonusHighLightTimeLine = undefined;
        }

        if (isFirstTime === false) {
            await this.turnCurrentlyHighlightedWinningNumbersToNormalColour();
        }

        const amountToGoUp =
            this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount() - this._currentHighlightedMultiplierNum;
        if (amountToGoUp > 1 || isFirstTime === true) {
            //Player has collect more than one of fruit glass symbols during this spin
            //we have to briefly light up the middle one
            const startingIndex = isFirstTime
                ? this._currentHighlightedMultiplierNum
                : this._currentHighlightedMultiplierNum + 1;

            await this.highlightTransitionWinningAmounts(startingIndex);
        }

        await this.highlightCurrentWinningAmountTexts();

        this._currentHighlightedMultiplierNum = this._lockandReelBonusSubGame.getCurrentFoundDrinksSymbolCount();
    }
}
