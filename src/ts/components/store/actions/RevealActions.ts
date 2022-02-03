import { BaseAction } from "playa-core";
import { action } from "mobx";
import { iwActions, iwProps } from "playa-iw";
import { GameData, ICardData, IGameSymbolData } from "../GameData";
import { gameStore } from "../..";
import { RDS_SUPPORTED } from "../../../main";

/**
 * RevealActions
 */
export class RevealActions extends BaseAction<GameData> {
    @action.bound
    public setFirstCycleComplete(firstCycleComplete: boolean): void {
        this._data.firstCycleComplete = firstCycleComplete;
    }

    @action.bound
    public initWinningNumbersData(...winningNumbersData: ICardData[]) {
        this._data.winningNumbersData = [...winningNumbersData];
    }

    @action.bound
    public initGameSymbolsData(...playerNumbersData: IGameSymbolData[]) {
        this._data.gameSymbolsData = [...playerNumbersData];
    }

    @action.bound
    public setWinningNumberData(index: number, revealed: boolean, number: any, lastRevealed: boolean) {
        // We only want to be storing wagerData if we have NOT uncovered a WIN ALL
        // This is because a GIP with a WIN ALL already revealed will simply start and immediately finish
        this._data.winningNumbersData[index] = { revealed, symbol: number, lastRevealed };
        if (!gameStore.props.revealAllEnabled) {
            this.setWagerDataSave();
        }
    }

    @action.bound
    public setGameSymbolDataAndSaveToWagerDataSave(vars: {
        index: number;
        revealed: boolean;
        symbol: string;
        lastRevealed: boolean;
        isBonus: boolean;
        bonusComplete: boolean;
    }) {
        this._data.gameSymbolsData[vars.index] = {
            revealed: vars.revealed,
            symbol: vars.symbol,
            lastRevealed: vars.lastRevealed,
            isBonus: vars.isBonus,
            bonusComplete: vars.bonusComplete,
        };

        if (!gameStore.props.revealAllEnabled) {
            this.setWagerDataSave();
        }
    }

    @action.bound
    public setWagerDataSave() {
        // If the last item has been revealed, clear the TURN data, so empty data being set to RDS
        // Otherwise a new wager GIP could end up revealing wrong info!
        if (this._data.lastItemRevealed) {
            this.resetTurnData();
        }

        if (RDS_SUPPORTED) iwActions.controlActions.setWagerDataSave(this._data);
    }

    @action.bound
    public addWin(amount: number) {
        if (amount === undefined) {
            throw new Error("Attempted to update win with an invalid value");
        }
        // Update win total
        this._data.winTotal += amount;
    }

    @action.bound
    public resetWagerData() {
        this._data.winTotal = 0;
        this._data.totalWinningSymbolsCount = 0;
        this.resetTurnData();
        this.setFirstCycleComplete(false);
    }

    @action.bound
    public resetTurnData() {
        this._data.gameSymbolsData.forEach((d) => {
            d.revealed = false;
            d.symbol = "";
        });

        // Bonus game no longer revealed!
        this.setBonusGameRevealed(false);
    }

    @action.bound
    public infoButtonPressed(pressed: boolean) {
        this._data.infoButtonPressed = pressed;
    }

    @action.bound
    public setWheelBonusTriggered(num: number) {
        this._data.wheelBonusTriggered = num;
    }

    @action.bound
    public setBaseGameVisible(visible: boolean) {
        this._data.baseGameVisible = visible;
    }

    @action.bound
    public setBonusGameTriggered(triggered: boolean) {
        this._data.bonusGameTriggered = triggered;
    }

    @action.bound
    public setLastItemRevealed(revealed: boolean) {
        this._data.lastItemRevealed = revealed;
    }

    @action.bound
    public setSettingsButtonEnabled(enabled: boolean) {
        iwActions.controlActions.enableHelpAndPaytableControls(enabled);
    }

    @action.bound
    public setBonusGameRevealed(revealed: boolean) {
        this._data.bonusGameRevealed = revealed;
    }

    @action.bound
    public toggleRevealAllControl(enabled: boolean) {
        this._data.revealAllControlEnabled = enabled;
    }

    @action.bound
    public setNewGameJustStarted(isJustStarted: boolean) {
        this._data.newGameJustStarted = isJustStarted;
    }

    @action.bound
    public setLockAndHoldGameCompleted(completed: boolean) {
        this._data.lockAndHoldGameCompleted = completed;
    }

    @action.bound
    public setLockAndHoldGameTriggered(completed: boolean) {
        this._data.lockAndHoldGameTriggered = completed;
    }

    @action.bound
    public startNewGame() {
        this._data.newGameJustStarted = true;
    }

    @action.bound
    public setbaseGameJustFinished(justFinished: boolean) {
        this._data.baseGameJustFinished = justFinished;
    }

    @action.bound
    public SetHasInitialSpinningAnimationFinishedPlaying(completed: boolean) {
        this._data.hasInitialSpinningAnimationFinishedPlaying = completed;
    }

    @action.bound
    public setWinLevel(winLevel: number): void {
        this._data.winLevel = winLevel;
    }

    @action.bound
    public setWinPlauqeIsUp(isUp: boolean): void {
        this._data.winPlaqueIsUp = isUp;
    }

    @action.bound
    public setMarketingScreenisOff(isOff: boolean): void {
        this._data.marketingScreenisOff = isOff;
    }

    @action.bound
    public increaseTotalWinningSymbolsCountByAmount(increaseAmount: number) {
        if (this._data.totalWinningSymbolsCount >= 3) {
            const previousWinningAmount = iwProps.prizeTable.get(`M${this._data.totalWinningSymbolsCount}`) as number;
            this._data.winTotal -= previousWinningAmount;
        }

        this._data.totalWinningSymbolsCount += increaseAmount;
        if (this._data.totalWinningSymbolsCount >= 3) {
            const currentWinningAmount = iwProps.prizeTable.get(`M${this._data.totalWinningSymbolsCount}`) as number;
            this._data.winTotal += currentWinningAmount;
        }
    }
}
