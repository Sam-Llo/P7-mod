import { Command, ICommand } from "playa-core";
import { BackgroundAudio } from "../BackgroundAudio";

/**
 * Background Music Start Command
 */
export class StartCommand extends Command implements ICommand {
    private _bgAudio: BackgroundAudio;

    constructor(views: { backgroundAudio: BackgroundAudio }) {
        super([views]);
        this._bgAudio = views.backgroundAudio;
    }

    execute() {
        super.execute();
        this._bgAudio.startBGAudio();
        this.resolveCompleted();
    }
}
