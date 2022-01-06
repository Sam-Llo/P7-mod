import { soundManager, BaseView, ParentDef } from "playa-core";
import { BackgroundAudioCommands } from "./commands/BackgroundAudioCommands";

/**
 * BackgroundAudio
 */
export class BackgroundAudio extends BaseView<any, null, any, BackgroundAudioCommands> {
    // Sound command strings
    public static readonly BASE_MUSIC_START_LOOP: string = "BaseMusicLoop";

    // Sound command strings
    public static readonly BONUS_MUSIC_START_LOOP: string = "BonusMusicLoop";

    // Win terminator
    private readonly WIN_TERMINATOR: string = "BaseMusicStopWin";

    // NonWin terminator
    private readonly NONWIN_TERMINATOR: string = "BaseMusicStopLose";

    public constructor() {
        super(new ParentDef(null, null), {}, undefined, [], "");
    }

    public setCommands(commandsSet: BackgroundAudioCommands) {
        this._commands = commandsSet;
    }

    /**
     * startBGAudio
     */
    public startBGAudio() {
        soundManager.execute(BackgroundAudio.BASE_MUSIC_START_LOOP);
    }

    /**
     * resultTerminator
     */
    public resultTerminator(result: string): void {
        let nextState: string = "";
        switch (result) {
            case "WIN":
                nextState = this.WIN_TERMINATOR;
                break;
            default:
                //Default to no win
                nextState = this.NONWIN_TERMINATOR;
                break;
        }

        // Execute
        soundManager.execute(nextState);
    }
}
