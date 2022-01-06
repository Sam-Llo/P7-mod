import { action } from "mobx";
import { BaseAction } from "playa-core";
import { SymbolsCollectionData } from "./SymbolsCollectionData";

/**
 * SymbolsCollectionActions
 */
export class SymbolsCollectionActions extends BaseAction<SymbolsCollectionData> {
    @action.bound
    public initGameSymbols(gameSymbols: string[]) {
        this._data.gameSymbols = [];
        this._data.gameSymbols = gameSymbols.slice();
    }
}
