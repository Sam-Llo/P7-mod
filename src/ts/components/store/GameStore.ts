import { IWStore, IWProps, IWPanelActions } from "playa-iw";
import { BaseStore } from "playa-core";
import { GameData } from "./GameData";
import { GameProps } from "./GameProps";
import { IWControlActions } from "./actions/IWControlActions";
import { RevealActions } from "./actions/RevealActions";
/**
 * Actions that Game store provides
 */
type Actions = {
    controlActions: IWControlActions;
    revealActions: RevealActions;
};

/**
 * Game store
 */
export class GameStore extends BaseStore<IWProps, IWPanelActions, GameProps, Actions, GameData> {
    public constructor(iwProps: IWProps, iwActions: IWPanelActions) {
        const data = new GameData();
        const props = new GameProps(iwProps, data);
        const actions = {
            controlActions: new IWControlActions(data),
            revealActions: new RevealActions(data),
        };
        super({ props: iwProps, actions: iwActions }, props, actions, data, [IWStore]);
    }

    public bonusGamePauseOnRevealAll(comparisonList: string[]): boolean {
        const skinCodeMatch = document.location.search.match(/[?&]skincode=([^&]+)/);
        const skinCode = skinCodeMatch ? skinCodeMatch[1] : "";
        return comparisonList.indexOf(skinCode) > -1;
    }
}
