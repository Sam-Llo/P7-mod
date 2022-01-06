import { Command } from "playa-core";
import { BackgroundAudio } from "../BackgroundAudio";
import { StartCommand } from "./StartCommand";
import { TerminateCommand } from "./TerminateCommand";

/**
 * Background Audio Commands
 */
export class BackgroundAudioCommands {
    [key: string]: (...pl) => Command;

    public startCommand: () => StartCommand;

    public terminateCommand: (res: string) => TerminateCommand;

    public constructor(backgroundAudio: BackgroundAudio) {
        const views = {
            backgroundAudio,
        };

        this.startCommand = () => new StartCommand(views);
        this.terminateCommand = (res: string) => new TerminateCommand(views, res);
    }
}
