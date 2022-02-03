import { observable } from "mobx";

export interface ICardData {
    revealed: boolean;
    symbol: any;
    lastRevealed: boolean;
}

export interface IGameSymbolData extends ICardData {
    revealed: boolean;
    symbol: any;
    lastRevealed: boolean;
    isBonus: boolean;
    bonusComplete: boolean;
}

export enum BonusGameType {
    WHEEL_BONUS,
    PICKER_BONUS,
}

/**
 * GameData
 */
export class GameData {
    @observable public firstCycleComplete: boolean;

    @observable public winTotal: number;

    @observable public winningNumbersData: ICardData[];

    @observable public gameSymbolsData: IGameSymbolData[];

    @observable public infoButtonPressed: boolean;

    @observable public wheelBonusTriggered: number;

    @observable public baseGameVisible: boolean;

    @observable public winLevel: number;

    @observable public lastItemRevealed: boolean;

    @observable public revealAllControlEnabled: boolean;

    @observable public bonusGameTriggered: boolean;

    @observable public bonusGameRevealed: boolean;

    @observable public newGameJustStarted: boolean;

    @observable public lockAndHoldGameTriggered: boolean;

    @observable public lockAndHoldGameCompleted: boolean;

    @observable public baseGameJustFinished: boolean;

    @observable public hasInitialSpinningAnimationFinishedPlaying: boolean;

    @observable public totalWinningSymbolsCount: number;

    @observable public winPlaqueIsUp: boolean;

    @observable public marketingScreenisOff: boolean;

    public constructor() {
        this.firstCycleComplete = false;
        this.winTotal = 0;
        this.winningNumbersData = [];
        this.gameSymbolsData = [];
        this.infoButtonPressed = false;
        this.wheelBonusTriggered = -1;
        this.baseGameVisible = true;
        this.lastItemRevealed = false;
        this.revealAllControlEnabled = true;
        this.bonusGameTriggered = false;
        this.bonusGameRevealed = false;
        this.newGameJustStarted = false;
        this.lockAndHoldGameTriggered = false;
        this.lockAndHoldGameCompleted = false;
        this.baseGameJustFinished = false;
        this.hasInitialSpinningAnimationFinishedPlaying = false;
        this.totalWinningSymbolsCount = 0;
        this.winLevel = 0;
        this.winPlaqueIsUp = false;
        this.marketingScreenisOff = false;
    }
}
