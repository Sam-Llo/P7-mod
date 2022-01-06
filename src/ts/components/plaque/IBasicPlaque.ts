/**
 * Basic Plaque definition
 */
export interface IBasicPlaque {
    show(...args: string[]): void;

    hide(): void;
}
