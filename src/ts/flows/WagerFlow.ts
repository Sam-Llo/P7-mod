import { GameFlow, SequenceDefinition } from "playa-core";
import {
    IWStore,
    IWProxyService,
    PricePointSelector,
    IWHelpPaytableControl,
    SubGame,
    MoveToMoneyService,
    STOP_REASON,
    iwProps,
} from "playa-iw";
import { start } from "repl";
import { endBatch } from "mobx/lib/internal";
import { ResultSettings } from "../components/resultPlaques/ResultSettings";
import { WinUpToSettings } from "../components/winUpTo/WinUpToSettings";
import { MarketingScreenSettings } from "../components/marketingScreen/MarketingScreenSettings";
import { FooterSettings } from "../components/footer/FooterSettings";
import { GameStore } from "../components/store/GameStore";
import { BackgroundAudio } from "../components/background/BackgroundAudio";
import { GameUIControls } from "../components/uiControls/GameUIControls";
import { RevealAllSettings } from "../components/revealAll/RevealAllSettings";
import { GamePayTable } from "../components/paytable/GamePayTable";

/**
 * BaseGame flow definition
 */
export class WagerFlow extends GameFlow {
    public logStage(): null {
        const store = this.getStore(IWStore);
        // prettier-ignore
        // eslint-disable-next-line no-console
        console.log('IWGF WF ixfState:', store.ixfState, 'Stage:', store.response.outcomeDetail.stage, 'nextStage:', store.response.outcomeDetail.nextStage);

        return null;
    }

    protected onBeforeShowStage(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        this.logStage();
        return new SequenceDefinition()
            .start()
            .start({ condition: () => iwStore.gameConfig.lotteryPhaseType === "2" }) //Might not need this, we might always want to show marketing screen, but we will see
            .do(this.getCommands(MarketingScreenSettings).firstLoadCommand())
            .do(this.getCommands(GamePayTable).initialSymbolSelectionReelResetCommand())
            .end()
            .end();
    }

    /**
     * onStartGameInitial
     * This method being called once game being initialised, here are only two cases the game will be initialised, once in game start (page loads) and once from move to money (transition from Try mode to Buy mode with do(IWProxyService.getCommands().gameReInitCommand() got called)
     */
    protected onStartGameInitial(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        this.logStage();
        return (
            new SequenceDefinition()
                .start()
                .do(this.getCommands(WinUpToSettings).alignCommand())
                .do(this.getCommands(GameUIControls).customPositioningCommand())
                .do(this.getCommands(RevealAllSettings).customPositioningCommand())
                .do(this.getCommands(GameUIControls).setUpCommand(iwStore.wagerType))
                .do(this.getCommands(FooterSettings).clearWinCommand())
                .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_EXIT]))
                .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_PLAY]))
                // .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_AUTO_BUY])) //hide by default, we might need this
                .start({ condition: () => iwStore.gameConfig.lotteryPhaseType === "2" })
                .do(this.getCommands(PricePointSelector).enableCommand())
                .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_BUY]))
                .do(this.getCommands(GameUIControls).enableControlCommand([GameUIControls.BTN_BUY], true)) //Might not need to enable control command buy because it will be neabled by default
                .do(this.getCommands(GameUIControls).buyButtonHighlightCommand(true))
                .do(this.getCommands(GameUIControls).buyCommand(null), { blocking: true })
                .group(this.resetAfterBuyPressed())
                .end()
                .end()
        );
    }

    protected onBeforeRequest(): SequenceDefinition {
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(FooterSettings).clearWinCommand())
            .end();
    }

    protected onMakeRequest(): SequenceDefinition {
        this.logStage();
        return (
            new SequenceDefinition()
                .start()
                // .do(this.getCommands(GameUIControls).decrementAutoBuyCommand(null), { blocking: true }) //we don't do auto buy at all for this game at moment
                // .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], true))
                .do(IWProxyService.getCommands().wagerInitCommand())
                .end()
        );
    }

    protected onAbortNextStage(): SequenceDefinition {
        return (
            new SequenceDefinition()
                .start()
                // .do(this.getCommands(GameUIControls).autoBuyStopCommand(STOP_REASON.AUTO))
                // .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(true))
                .end()
        );
    }

    /**
    onResetNextStage function will get called after any recoverable error dialog hidden. such as insufficient fund. And reset the stage back.
    Reset all SubGames, and renable buy button yto ressemble the fisrt time player play the gam ftom beggnning
    */
    protected onResetNextStage(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        // prettier-ignore
        return new SequenceDefinition()
        .start()
		// .do(this.getCommands(GameUIControls).autoBuyStopCommand(STOP_REASON.AUTO))
        .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], false))
        .do(this.getCommands(ResultSettings).hideCommand())
        .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_PLAY]))
        .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_BUY]))
        // Enable the following ONLY if AutoBuy is enabled (see main.ts)
		// .start({ condition: () => iwProps.autoBuyConfig !== undefined && iwProps.autoBuyConfig.steps !== undefined && iwProps.autoBuyConfig.steps.length > 0 })
        //     .do(this.getCommands(GameUIControls).autoBuyButtonEnable(true))
        // .end()
        .do(this.getCommands(PricePointSelector).showCommand(true))
        .do(this.getCommands(PricePointSelector).enableCommand())
        .do(this.getCommands(SubGame).resetCommand())
        .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(true))
        .do(this.getCommands(GameUIControls).buyCommand(null), { blocking: true })
        .group(this.resetAfterBuyPressed())
        .end();
    }

    //called when player bought ticket sucessfully, this is the place Senario data received, so that we can use senario data to populate each SubGame (for this game, only Base Game and Lock and reel bonus game will be populated)
    protected onResolveStage(): SequenceDefinition {
        const store = this.getStore(GameStore);
        const iwStore = this.getStore(IWStore);
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], false))
            .do(this.getCommands(BackgroundAudio).startCommand())
            .do(this.getCommands(FooterSettings).clearWinCommand())
            .do(this.getCommands(GamePayTable).initialSymbolSelectionReelLandingCommand(), { blocking: true }) //Added here to make the reel land
            .do(this.getCommands(SubGame).populateCommand(), { blocking: true })
            .do(this.getCommands(RevealAllSettings).showControlCommand(true))
            .do(this.getCommands(RevealAllSettings).enableControlCommand(true))
            .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(true))
            .do(this.getCommands(SubGame).playCommand(), { blocking: true })
            .end();
    }

    /**
     * Called when this stage has finished
     */
    protected onExitStage(): SequenceDefinition {
        this.logStage();
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_PLAY]))
            .end();
    }

    /**
     * Called when Back from RevealFlow to this WagerFlow
     */
    protected onEnterNextStage(): SequenceDefinition {
        this.logStage();
        return new SequenceDefinition().start().end();
    }

    /**
     * Game Ended
     */
    protected onEndGame(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        this.logStage();
        return (
            new SequenceDefinition()
                .start()
                // Do not remove, this should always be present
                .do(IWProxyService.getCommands().compulsionDelayCommand(), { blocking: true })
                .end()
        );
    }

    /**
     * Set up stage to that new game (second or more rounds) can be played
     */
    protected onBeginNewGame(): SequenceDefinition {
        const iwStore = this.getStore(IWStore);
        this.logStage();
        //Phase 2 represents player have not hit the buy button, so player in a unpurchased state
        // We will need to do two different things, depending on whether we're in Phase 1 or 2
        // We absolutely DO NOT want to enable the buy button if in Phase 1
        return (
            new SequenceDefinition()
                .start()
                .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(true))
                .start({ condition: () => iwStore.gameConfig.lotteryPhaseType === "1" })
                .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_EXIT]))
                .do(this.getCommands(GameUIControls).exitCommand(null), { blocking: true }) //By setting exit command to be blocking, we created the effect that only when user hit exit button, the game will be continue.
                .do(this.getCommands(GameUIControls).buyCommand(null), { blocking: true }) //Same as above
                .group(this.resetAfterBuyPressed())
                .end()
                .start({ condition: () => iwStore.gameConfig.lotteryPhaseType === "2" })
                // If we need to display the move to money prompt...
                .start({ condition: () => iwStore.displayMoveToMoneyPrompt })
                .do(this.getCommands(PricePointSelector).showCommand(false))
                .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_BUY]))
                .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_MOVE_TO_MONEY_PROMPT]))
                .do(this.getCommands(GameUIControls).showPromptCommand(null), { blocking: true })
                .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_MOVE_TO_MONEY_PROMPT]))
                .do(this.getCommands(ResultSettings).hideCommand())
                .do(MoveToMoneyService.getCommands().handlePromptCommand(), { blocking: true })
                .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_BUY]))
                .do(this.getCommands(PricePointSelector).showAndEnableCommand())
                .do(this.getCommands(GameUIControls).buyCommand(null), { blocking: true })
                .group(this.resetAfterBuyPressed())
                .end()

                // If we are not displaying M2M...
                .start({ condition: () => !iwStore.displayMoveToMoneyPrompt })
                .do(
                    this.getCommands(GameUIControls).showControlCommand([
                        GameUIControls.BTN_BUY,
                        GameUIControls.BTN_SETTINGS,
                    ]),
                )

                .do(this.getCommands(PricePointSelector).showAndEnableCommand())
                .do(this.getCommands(GameUIControls).buyCommand(null), { blocking: true })
                .group(this.resetAfterBuyPressed())
                .end()
                .end()
                .end()
        );
    }

    public autoReplyingOnSequenceEnd = (state: string) => {
        return true;
    };

    private resetAfterBuyPressed(): SequenceDefinition {
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(SubGame).resetCommand())
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_BUY]))
            .do(this.getCommands(ResultSettings).hideCommand())
            .do(this.getCommands(PricePointSelector).startGameCommand())
            .do(this.getCommands(RevealAllSettings).resetCommand())
            .do(this.getCommands(RevealAllSettings).showControlCommand(false))
            .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(false))
            .do(this.getCommands(GameUIControls).delayShowControlCommand([GameUIControls.NETWORK_ACTIVITY], true))
            .end();
    }
}
