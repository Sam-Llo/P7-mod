import { iwProps, iwActions } from "playa-iw";
import { GameStore } from "./store/GameStore";

// custom components defined on game side
export * from "./uiControls/GameUIControls";
export * from "./footer/FooterSettings";
export * from "./marketingScreen/MarketingScreenSettings";
export * from "./winUpTo/WinUpToSettings";
export * from "./store/GameStore";

export const gameStore = new GameStore(iwProps, iwActions.panelActions);
