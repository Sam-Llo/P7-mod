/**
 * Symbol Card definition
 */
export interface ISymbolCard {
    init(): void;

    enable(): void;

    disable(): void;

    populate(data: any): void;

    reveal(): void;

    match(): void;

    reset(): void;
}
