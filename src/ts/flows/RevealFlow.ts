import { GameFlow, SequenceDefinition } from "playa-core";
import {
    IWStore,
    IWProxyService,
    RdsState,
    PricePointSelector,
    IWHelpPaytableControl,
    SubGame,
    STOP_REASON,
} from "playa-iw";
import { ResultSettings } from "../components/resultPlaques/ResultSettings";
import { WinUpToSettings } from "../components/winUpTo/WinUpToSettings";
import { FooterSettings } from "../components/footer/FooterSettings";
import { GameStore } from "../components/store/GameStore";
import { BackgroundAudio } from "../components/background/BackgroundAudio";
import { GameUIControls } from "../components/uiControls/GameUIControls";
import { RevealAllSettings } from "../components/revealAll/RevealAllSettings";
import { GamePayTable } from "../components/paytable/GamePayTable";
import { MarketingScreenSettings } from "../components";

/**
 * BaseGame flow definition
 */
export class RevealFlow extends GameFlow {
    public logStage(): null {
        const store = this.getStore(IWStore);
        // prettier-ignore
        // eslint-disable-next-line no-console
        console.log('IWGF RF ixfState:', store.ixfState, 'Stage:', store.response.outcomeDetail.stage, 'nextStage:', store.response.outcomeDetail.nextStage);

        return null;
    }

    protected onBeforeShowStage(): SequenceDefinition {
        //Only if game is already started and it is in Reveal flow will onBefore show State got called
        const store = this.getStore(IWStore);
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(GameUIControls).setUpCommand(store.wagerType))
            .do(this.getCommands(GameUIControls).customPositioningCommand())
            .do(this.getCommands(RevealAllSettings).customPositioningCommand())
            .do(this.getCommands(FooterSettings).clearWinCommand())
            .end();
    }

    protected onStartGameInProgressStage(): SequenceDefinition {
        //This will gets called if this flow is the one that player has already playing when they left. this calls first, then onStartGameInProgressNextStages
        const store = this.getStore(IWStore);
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(WinUpToSettings).alignCommand())
            .do(IWProxyService.getCommands().wagerUpdateCommand())
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_BUY]))
            .do(this.getCommands(PricePointSelector).startGameCommand())
            .do(this.getCommands(SubGame).resetCommand())
            .do(this.getCommands(GamePayTable).initialSymbolSelectionReelSnapToSymbolCommand())
            .end();
    }

    //Player left the game for some reason, this will gets called when they left a game-in-progress, in here, we Re set up the stage so player can continue playing it.
    protected onStartGameInProgressNextStage(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        const { nextStage } = iwStore.response.outcomeDetail; //RM: why does the linter prefer this?
        this.logStage();
        // prettier-ignore
        // eslint-disable-next-line no-alert
        return new SequenceDefinition()
            .start()
                .do(this.getCommands(BackgroundAudio).startCommand()) 
                .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_EXIT]))
                .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_PLAY]))
                .do(this.getCommands(SubGame).populateCommand(), {blocking: true})
                .do(this.getCommands(RevealAllSettings).showControlCommand(true))
                .do(nextStage === "Scenario" ? IWProxyService.getCommands().enableRdsCommand() : IWProxyService.getCommands().disableRdsCommand())
                .do(this.getCommands(SubGame).playCommand(), {blocking: true})
            .end();
    }

    protected onEnterNextStage(): SequenceDefinition {
        const store = this.getStore(GameStore);
        this.logStage();
        return new SequenceDefinition().start().end();
    }

    protected onBeforeRequest(): SequenceDefinition {
        //Bijian's Note. Client constantly send request to server, may be sending rds changes if rds is dirty, means new save to rds should be send.
        const iwStore = this.getStore(IWStore);
        this.logStage();

        return new SequenceDefinition().start().end();
    }

    protected onInProgressStage(): SequenceDefinition {
        const store = this.getStore(GameStore);
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(SubGame).playCommand(), { blocking: true })
            .end();
    }

    protected onMakeRequest(): SequenceDefinition {
        //Bijian's note, client constly make quest to server to keep this game alive?
        const iwStore = this.getStore(IWStore);
        this.logStage();

        return (
            new SequenceDefinition()
                .start()
                .start({ condition: () => iwStore.rdsState === RdsState.SENDING })
                .do(IWProxyService.getCommands().wagerUpdateCommand()) //Let server know the current game-in-progress game state
                .end()
                //iwStore.rdsState === RdsState.NA when all subGames have revealed.
                .start({ condition: () => iwStore.rdsState === RdsState.NA })
                .do(this.getCommands(RevealAllSettings).enableCommand(false))
                .do(this.getCommands(RevealAllSettings).enableControlCommand(false))
                .do(this.getCommands(RevealAllSettings).showControlCommand(false))
                .do(IWProxyService.getCommands().wagerLastPlayCommand())
                .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(false))
                .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], true))
                .end()
                .end()
        );
    }

    protected onAbortNextStage(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        return new SequenceDefinition()
            .start()
            .start({ condition: () => iwStore.rdsState === RdsState.SENDING })
            .do(IWProxyService.getCommands().disableRdsCommand()) //Cancel RDS
            .end()
            .end();
    }

    protected onResetNextStage(): SequenceDefinition {
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], false)) //might need to turn off GameUIControls.NETWORK_ACTIVITY
            .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_RETRY]))
            .do(this.getCommands(GameUIControls).retryCommand(null), { blocking: true })
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_RETRY]))
            .end();
    }

    protected onEndGame(): SequenceDefinition {
        this.logStage();
        return new SequenceDefinition().start().end();
    }

    protected onResolveStage(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        const store = this.getStore(GameStore);
        const { nextStage } = iwStore.response.outcomeDetail;
        this.logStage();
        //Bijian's note, because request is being send to server automatically because of Instant Win game nature, we will receive it and resolve in on onResolveStage.
        //Bijian's Note, here we are checking if game is ended or not, if not we enabled (keep) rds or disabled (cancel) rds based on wagerType ("BUT/already bought the tickt, game-in-progerss (unfinished), "RETRY/finished current ticket maybe?")
        if (iwStore.rdsState === RdsState.SENDING || nextStage === "Scenario") {
            //after reveal data save call, or first play after buy
            return new SequenceDefinition()
                .start()
                .do(
                    iwStore.wagerType === "BUY"
                        ? IWProxyService.getCommands().enableRdsCommand()
                        : IWProxyService.getCommands().disableRdsCommand(),
                )
                .end();
        }
        //Bijian's note, when reached here, it means the game has comed to the end (all numbers revealed, all bonus game played), and the check win has been done already, thus result can be displayed with reuslt settings Plaque
        //after last play call
        return (
            new SequenceDefinition()
                .start()
                .do(
                    this.getCommands(ResultSettings).populateCommand({
                        playResult: iwStore.playResult,
                        prizeValue: iwStore.prizeValue,
                        wagerType: iwStore.wagerType,
                    }),
                )
                .do(this.getCommands(FooterSettings).populateCommand(store.winTotal))
                .do(this.getCommands(ResultSettings).showCommand())
                .do(this.getCommands(BackgroundAudio).terminateCommand(iwStore.playResult))
                .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], false))
                // .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(true))
                .do(this.getCommands(GamePayTable).initialSymbolSelectionReelResetCommand()) //Reset the reel at the game ends
                .end()
        );
    }

    protected onExitStage(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        const { nextStage } = iwStore.response.outcomeDetail;
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_PLAY]))
            .start({ condition: () => nextStage === "Reveal" }) //before last  play call
            .do(IWProxyService.getCommands().disableRdsCommand())
            .end()
            .end();
    }

    public autoReplyingOnSequenceEnd = (state: string) => {
        return true;
    };
}
