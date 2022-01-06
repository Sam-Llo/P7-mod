import { Command, ICommand } from "playa-core";
import { BackgroundAudio } from "../BackgroundAudio";

/**
 * Background Music Start Command
 */
export class TerminateCommand extends Command implements ICommand {
    private _bgAudio: BackgroundAudio;

    private _playResult: string;

    constructor(views: { backgroundAudio: BackgroundAudio }, playResult: string) {
        super([views]);
        this._bgAudio = views.backgroundAudio;
        this._playResult = playResult;
    }

    execute() {
        super.execute();
        this._bgAudio.resultTerminator(this._playResult);
        this.resolveCompleted();
    }
}
