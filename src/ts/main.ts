import "../css/launcher.css";
import "../css/settings.css";
import "../css/paytable.css";

import {
    GameFlowManager,
    initializationManager,
    gameActions,
    proxyActions,
    MobxTool,
    SoundTool,
    QaTools,
    StorageService,
    StorageTypes,
    layoutService,
    SoundService,
    SoundTypes,
    systemProps,
    EmitterCommandSet,
} from "playa-core";

import {
    iwProps,
    IWStore,
    iwActions,
    IWProxyControls,
    FooterCommands,
    SettingsPanel,
    WinUpToCommands,
    ResultCommands,
    PricePointCommands,
    RevealAllComponent,
    IWHelpPaytableControl,
    IWHelpPaytableCommands,
    MoveToMoneyPrompt,
    MarketingScreenCommands,
} from "playa-iw";

import * as PIXI from "pixi.js";
import { WagerFlow } from "./flows/WagerFlow";
import { RevealFlow } from "./flows/RevealFlow";
import { DefaultEffectsHandler } from "./flows/effects/DefaultEffectsHandler";
import { landscape, portrait } from "./configs/dimensions";
import { WinUpToSettings } from "./components/winUpTo/WinUpToSettings";
import { MarketingScreenSettings } from "./components/marketingScreen/MarketingScreenSettings";
import { FooterSettings } from "./components/footer/FooterSettings";
import { ResultSettings } from "./components/resultPlaques/ResultSettings";
import { gameStore } from "./components";
import { BackgroundSwap } from "./components/background/BackgroundSwap";
import { BackgroundAudio } from "./components/background/BackgroundAudio";
import { BackgroundAudioCommands } from "./components/background/commands/BackgroundAudioCommands";
import { GameUIControls } from "./components/uiControls/GameUIControls";
import { GameUICommands } from "./components/uiControls/commands/GameUICommands";
import { RevealAllSettings } from "./components/revealAll/RevealAllSettings";
import { RevealAllSettingsCommands } from "./components/revealAll/commands/RevealAllSettingsCommands";
import { SymbolsCollectionSubGame } from "./components/symbolsCollectionSubGame/SymbolsCollectionSubGame";
import { LockAndReelBonusSubGame } from "./components/lockAndReelBonusSubGame/LockAndReelBonusSubGame";
import { ExtendedSymbolsCollectionCommands } from "./components/symbolsCollectionSubGame/commands/ExtendedSymbolsCollectionCommands";
import { GamePayTable } from "./components/paytable/GamePayTable";
import { InitialSymbolSelectionReelCommands } from "./components/paytable/commands/InitialSymbolSelectionReelCommands";
import { CoinShowerEmitter } from "./components/coinShowerEmitter/CoinShowerEmitter";
import { LockAndReelBonusCommands } from "./components/lockAndReelBonusSubGame/commands/LockAndReelBonusCommands";
import { ExtendedPaytablePanel } from "./components/paytable/ExtendedPaytablePanel";
import { ExtendedPricePointSelector } from "./components/pricePointSelector/ExtendedPricePointSelector";

//Get the version number from the package.json via webpack.config.js
declare const VERSION;

// This MUST be the SAME for ALL SubGames
export const RDS_SUPPORTED: boolean = false;

// set up gameIds so we can define what is a 'Base Game' and what is a bonus
// Each 'game' will have a unique ID (number), so that we can keep track of which game is active
// It appears that the games associated with these IDs need to be instantiated in the same order,
// otherwise we get a mismatch for active game comparison (see SubGame.initReactions() and SubgGame.getNewGameId())
// Which can cause games not to be triggered
export enum GameIDs {
    BASE_PICK_GAME = 0,
    LOCK_AND_HOLD_BONUS = 1,
}

// put container names here for easy reference
const containerRef = {
    pricePointSelector: "pricePointSelector",
    resultPlaques: "resultPlaques",
    bonusAccumulator: "bonusAccumulator",
    wheelBonus: "wheelBonusContainer",
    winUpTo: "winUpTo",
    marketing: "marketingScreen",
    revealAll: "revealAllButton",
    pickerBonus: "pickerBonusContainer",
    background: "background",
    uiControls: "ui",
    symbolsCollection: "symbolsCollectionSubGame",
    lockAndReelBonusGame: "reels",
    coinShower2: "coinShowerLevel2",
    coinShower3: "coinShowerLevel3",
};

/// #if !FILTERED
(window as any).PIXI = PIXI;
const soundTool: SoundTool = new SoundTool();
const mobxTool: MobxTool = new MobxTool();
const qaTool: QaTools = new QaTools();
/// #endif

//DS: This circumvents existing systems, no actions should be called outside components, and this should not depend on initialization manager global usage
// should be provided at construction of LayoutService or SystemStore, or loaded as configuration at runtime or compile time
gameActions.setDimensions(...landscape);
gameActions.setDimensions(...portrait);

const soundService = new SoundService(SoundTypes.HOWLER);

const storageService = new StorageService(StorageTypes.RGS_PREFERENCES);

const revealAllComponent = new RevealAllSettings(
    iwProps,
    iwActions.controlActions,
    [RevealAllComponent.configName],
    containerRef.revealAll,
);

const uiControls = new GameUIControls(
    iwProps,
    iwActions.controlActions,
    [GameUIControls.configName],
    containerRef.uiControls,
);
const footerBar = new FooterSettings(iwProps, iwActions.controlActions, [IWStore]);

const pricePointSelector = new ExtendedPricePointSelector(
    iwProps,
    iwActions.controlActions,
    [ExtendedPricePointSelector.configName],
    containerRef.pricePointSelector,
    [IWStore],
);
const resultPlaques = new ResultSettings(iwProps, [ResultSettings.configName], containerRef.resultPlaques);

const lockAndReelBonusGame = new LockAndReelBonusSubGame(
    iwProps,
    iwActions.controlActions,
    [LockAndReelBonusSubGame.lockAndReelConfigName],
    containerRef.lockAndReelBonusGame,
    {
        gameId: GameIDs.LOCK_AND_HOLD_BONUS,
        introSupported: true,
        lazyLoadingSupported: false,
        autoPlaySupported: false,
        rdsSupported: RDS_SUPPORTED,
    },
);

const symbolsCollectionSubGame = new SymbolsCollectionSubGame(
    iwProps,
    iwActions.controlActions,
    [SymbolsCollectionSubGame.gameConfigName, SymbolsCollectionSubGame.scConfigName],
    containerRef.symbolsCollection,
    {
        gameId: GameIDs.BASE_PICK_GAME,
        introSupported: false,
        lazyLoadingSupported: false,
        autoPlaySupported: true,
        rdsSupported: RDS_SUPPORTED,
    },
);

const winUpTo = new WinUpToSettings(
    iwProps,
    iwActions.controlActions,
    [WinUpToSettings.configName],
    containerRef.winUpTo,
);

const coinShower2 = new CoinShowerEmitter(systemProps, containerRef.coinShower2, 2);
const coinShower3 = new CoinShowerEmitter(systemProps, containerRef.coinShower3, 3);

const marketingScreen = new MarketingScreenSettings(
    iwProps,
    iwActions.controlActions,
    [MarketingScreenSettings.configName, MarketingScreenSettings.symbolSelectionAnimationReelConfigName],
    containerRef.marketing,
    storageService,
);
const paytable = new GamePayTable(
    iwProps,
    iwActions.controlActions,
    [GamePayTable.configName, GamePayTable.initialSymbolSelectionConfig],
    "paytable",
);

const background = new BackgroundSwap(containerRef.background);
const backgroundAudio = new BackgroundAudio();
const helpPaytableControl = new IWHelpPaytableControl(iwProps, iwActions.controlActions);

const flowManager = new GameFlowManager();

flowManager.registerFlow("Wager", WagerFlow);
flowManager.registerFlow("Reveal", RevealFlow);

flowManager.registerEffectsHandler(DefaultEffectsHandler);

/**
 * Init
 */
function init() {
    uiControls.setCommands(new GameUICommands(uiControls));
    footerBar.setCommands(new FooterCommands(footerBar));
    resultPlaques.setCommands(new ResultCommands(resultPlaques));
    symbolsCollectionSubGame.setCommands(new ExtendedSymbolsCollectionCommands(symbolsCollectionSubGame));
    lockAndReelBonusGame.setCommands(new LockAndReelBonusCommands(lockAndReelBonusGame));
    pricePointSelector.setCommands(new PricePointCommands(pricePointSelector));
    winUpTo.setCommands(new WinUpToCommands(winUpTo));
    // pickerGame.setCommands(new PickerCommands(pickerGame));
    // wheelBonus.setCommands(new WheelBonusCommands(wheelBonus));
    marketingScreen.setCommands(new MarketingScreenCommands(marketingScreen));
    revealAllComponent.setCommands(new RevealAllSettingsCommands(revealAllComponent));
    backgroundAudio.setCommands(new BackgroundAudioCommands(backgroundAudio));
    helpPaytableControl.setCommands(new IWHelpPaytableCommands(helpPaytableControl));
    paytable.setCommands(new InitialSymbolSelectionReelCommands(paytable));
    coinShower2.setCommands(new EmitterCommandSet(coinShower2));
    coinShower3.setCommands(new EmitterCommandSet(coinShower3));
}

// INIT INIT INIT
init();

// SettingsPanel depends on assets
// As does MoveToMoneyPrompt
(async () => {
    if (PIXI.utils.isWebGLSupported()) {
        await initializationManager.start();

        // Set up the external HTML elements
        // For 'settingsPanel', First optional param enables AutoBuy settings tab in the settings panel (defaults to 'false') e.g. new SettingsPanel(true);
        // AutoBuy tab is currently clamped by default to 4 items (RGS data sends 5, but only 4 are required).
        // However, for future updates this can be overridden by passing a number (2nd param) to the SettingsPanelConstructor. e.g. new SettingsPanel(true, 5);
        //****************** NOTE *******************/
        // Do NOT enable AutoBuy as currently implemented. Standards are currently in flux and will be getting updated.
        const settingsPanel = new SettingsPanel();
        const moveToMoneyPrompt = new MoveToMoneyPrompt();
        // Init paytable after the settings panel so it is always on top
        const paytablePanel = new ExtendedPaytablePanel();
        const iwProxyControls = new IWProxyControls("help");

        iwActions.controlActions.setVersion(VERSION);

        //RM: Debug
        (window as any).iwProps = iwProps;
        (window as any).iwActions = iwActions;
        (window as any).proxyActions = proxyActions;
        (window as any).gameStore = gameStore;
        (window as any).layoutService = layoutService;
    }
})();
