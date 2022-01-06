import { observable } from "mobx";

/**
 * SymbolsCollectionData
 */
export class SymbolsCollectionData {
    @observable public gameSymbols: string[];

    public constructor() {
        this.gameSymbols = [];
    }
}
