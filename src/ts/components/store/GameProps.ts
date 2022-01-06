import { computed } from "mobx";
import { IWProps, RevealAllState } from "playa-iw";
import { GameData, ICardData, IGameSymbolData } from "./GameData";

/**
 * GameProps
 */
export class GameProps {
    private _data: GameData;

    private _parent: IWProps;

    public constructor(iwProps: IWProps, data: GameData) {
        this._data = data;
        this._parent = iwProps;
    }

    @computed
    public get firstCycleComplete(): boolean {
        return this._data.firstCycleComplete;
    }

    @computed
    public get winLevel(): number {
        return this._data.winLevel;
    }

    @computed
    public get winPlaqueIsUp(): boolean {
        return this._data.winPlaqueIsUp;
    }

    @computed
    public get bonusOutcome(): number {
        return parseInt(this._parent.scenario.split("|")[2], 10);
    }

    @computed
    public get winTotal(): number {
        return this._data.winTotal;
    }

    public get lockAndHoldBonusTriggered(): boolean {
        return this._data.lockAndHoldGameTriggered;
    }

    public get lockAndHoldGameCompleted(): boolean {
        return this._data.lockAndHoldGameCompleted;
    }

    @computed
    public get isFixedPricePoint(): boolean {
        return this._parent.isFixedPricePoint;
    }

    @computed
    public get winningNumbers(): any[] {
        const numbers = this._parent.scenario
            .split("|")[0]
            .split(",")
            .map((n) => parseInt(n, 10));
        return numbers;
    }

    //Not being used
    @computed
    public get gameSymbols(): any[] {
        const numberData = this._parent.scenario.split("|")[1].split(",");
        const numbers = numberData.map((data) => {
            const [num, dat] = data.split(":"); // [12, H0]
            const tempDat: any = dat !== undefined ? dat : "";
            return [num, ...tempDat]; // [12, H, 0]
        });
        return numbers;
    }

    //Not being used
    @computed
    public get winningNumbersData(): ICardData[] {
        return this._data.winningNumbersData;
    }

    @computed
    public get gameSymbolsData(): IGameSymbolData[] {
        return this._data.gameSymbolsData;
    }

    @computed
    public get revealedWinningNumbers(): string[] {
        return this._data.winningNumbersData.filter((d) => d.revealed).map((d) => String(d.symbol));
    }

    @computed
    public get revealedPlayerNumbers(): string[] {
        return this._data.gameSymbolsData.filter((d) => d.revealed).map((d) => String(d.symbol[0]));
    }

    @computed
    public get gameInProgress(): boolean {
        for (let i = 0; i < this._data.gameSymbolsData.length; i++) {
            if (this._data.gameSymbolsData[i].symbol !== "") return true;
        }
        return false;
        // return !this._data.gameSymbolsData.some((data) => data.symbol === "");
    }

    @computed
    public get wager(): number {
        return this._parent.wager;
    }

    @computed
    public get pickerBonusOutcome(): string {
        return this._parent.scenario.split("|")[2];
    }

    @computed
    public get wheelBonusOutcome(): string {
        const outcome = this._parent.scenario.split("|")[3];
        return outcome !== undefined ? outcome : "";
    }

    @computed
    public get wheelBonusTriggered(): number {
        return this._data.wheelBonusTriggered;
    }

    @computed
    public get wheelBonusWheelType(): number {
        //There should only ever be a single wheel bonus, of S, T or U (bronze, silver, gold)
        const playerNums = this.gameSymbols;
        const len = playerNums.length;
        const arrayOfWheelTypes = ["S", "T", "U"];
        let wheelType = -1;
        for (let i = 0; i < len; i++) {
            const idx = arrayOfWheelTypes.indexOf(playerNums[i][0]);
            if (idx > -1) {
                wheelType = idx;
                break;
            }
        }
        return wheelType;
    }

    @computed
    public get infoButtonPressed(): boolean {
        return this._data.infoButtonPressed;
    }

    @computed
    public get baseGameVisible(): boolean {
        return this._data.baseGameVisible;
    }

    @computed
    public get displayMoveToMoneyPrompt(): boolean {
        return this._parent.displayMoveToMoneyPrompt;
    }

    @computed
    public get revealAllControlEnabled(): boolean {
        return this._data.revealAllControlEnabled;
    }

    @computed
    public get lastItemRevealed(): boolean {
        return this._data.lastItemRevealed;
    }

    @computed
    public get bonusGameTriggered(): boolean {
        return this._data.bonusGameTriggered;
    }

    @computed
    public get bonusGameRevealed(): boolean {
        return this._data.bonusGameRevealed;
    }

    @computed
    public get revealAllEnabled(): boolean {
        return this._parent.revealAllState === RevealAllState.REVEAL_ALL_ENABLED;
    }

    @computed
    public get mainGameGridData(): string[] {
        return this._parent.scenario.split("|")[1].split("");
    }

    @computed
    public get testGameScenario(): string {
        return this._parent.scenario;
    }

    @computed
    public get initialSymbol(): string {
        return this._parent.scenario.split("|")[0];
    }

    @computed
    public get lockAndReelBonusGameData(): string[] {
        return this._parent.scenario.split("|")[2].split(",");
    }

    @computed
    public get isCurrentGameHasLockAndReelBonusGame() {
        return this.lockAndReelBonusGameData.length !== 1;
    }

    // @computed
    // public get isLockAndReelBonusGameThisRound(){
    //     return this._parent.scenario.split("|")[2] !== "";
    // }

    @computed
    public get lockAndReelBonusGameSymbolsCount(): number {
        const bonusGameData: string[] = this.lockAndReelBonusGameData;
        // const bonusGameDataArray: string[] = bonusGameData[bonusGameData.length -1].split("");
        const bonusGameDataLength = bonusGameData.length;
        const lastBonusGameData = bonusGameData[bonusGameDataLength - 1];
        const lastBonusGameDataArray = lastBonusGameData.split("");
        let totalSymbolsCount = 0;
        for (let i = 0; i < lastBonusGameDataArray.length; i++) {
            const isNumber: boolean = /^\d+$/.test(lastBonusGameDataArray[i]);
            if (isNumber === true) totalSymbolsCount += parseInt(lastBonusGameDataArray[i], 10);
        }

        return totalSymbolsCount;
    }

    @computed
    public get lockAndReelBonusGamePrize(): number {
        // alert(
        //     `this.lockAndReelBonusGameSymbolsCount ${
        //         this.lockAndReelBonusGameSymbolsCount
        //     } ,bonus game prize ${this._parent.prizeTable.get(`B${this.lockAndReelBonusGameSymbolsCount}`)}`,
        // );
        return this._parent.prizeTable.get(`B${this.lockAndReelBonusGameSymbolsCount}`) as number;
    }

    @computed
    public get baseGameJustFinished(): boolean {
        return this._data.baseGameJustFinished;
    }

    @computed
    public get hasInitialSpinningAnimationFinishedPlaying(): boolean {
        return this._data.hasInitialSpinningAnimationFinishedPlaying;
    }

    @computed
    public get newGameJustStarted(): boolean {
        return this._data.newGameJustStarted;
    }

    @computed
    public get totalWinningSymbolsCount(): number {
        return this._data.totalWinningSymbolsCount;
    }
}
