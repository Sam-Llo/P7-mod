import { LockAndReel } from "./LockAndReel";

export interface IOnCompleteCallbacks {
    onComplete(index: number, lockAndReel): void;
}
