import { computed } from "mobx";
import { IWProps } from "playa-iw";
import { SymbolsCollectionData } from "./SymbolsCollectionData";

/**
 * SymbolsCollectionProps
 */
export class SymbolsCollectionProps {
    private _data: SymbolsCollectionData;

    private _parent: IWProps;

    @computed
    public get gameSymbols(): any[] {
        return this._data.gameSymbols;
    }

    public constructor(data, parent) {
        this._data = data;
        this._parent = parent;
    }
}
