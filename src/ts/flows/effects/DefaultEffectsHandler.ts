import { SequenceDefinition, MobxUtils, SideEffectsFlow } from "playa-core";
import {
    IWStore,
    IWProxyService,
    PricePointSelector,
    SubGame,
    RevealAllState,
    iwActions,
    IWHelpPaytableControl,
    UIControls,
    RevealAllComponent,
} from "playa-iw";
import { FooterSettings } from "../../components/footer/FooterSettings";
import { gameStore, GameUIControls } from "../../components";
import { MarketingScreenSettings } from "../../components/marketingScreen/MarketingScreenSettings";
import { ResultSettings } from "../../components/resultPlaques/ResultSettings";
import { RevealAllSettings } from "../../components/revealAll/RevealAllSettings";

/**
 * Default side effects handler
 */
export class DefaultEffectsHandler extends SideEffectsFlow {
    private _mobxUtils: MobxUtils = MobxUtils.getInstance();

    attachListeners() {
        const iwProps = this.getProps(IWStore);
        // const knmProps = this.getProps(KeyNumberMatch);

        //Move to money on wager type change
        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_wagerTypeUpdated",
            () => iwProps.lastWagerType === "TRY" && iwProps.wagerType === "BUY",
            (moveToMoney) => moveToMoney && this.skipGameFlowAndRun(this.moveToMoney()),
        );

        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_pricePoint",
            () => iwProps.wager,
            () => {
                this.pauseGameFlowAndRun(
                    new SequenceDefinition()
                        .start()
                        .do(this.getCommands(SubGame).resetCommand())
                        .do(this.getCommands(FooterSettings).clearWinCommand())
                        .do(this.getCommands(ResultSettings).hideCommand())
                        .end(),
                );
            },
            { fireImmediately: true },
        );

        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_bonusGameTriggered",
            () => gameStore.props.bonusGameTriggered,
            (triggered: boolean) => {
                this.run(
                    new SequenceDefinition()
                        .start()
                        .start({ condition: () => triggered })
                        .do(this.getCommands(RevealAllSettings).showControlCommand(false))
                        .do(this.getCommands(PricePointSelector).showCommand(false))
                        .do(this.getCommands(UIControls).hideControlCommand([UIControls.BTN_SETTINGS]))
                        .end()
                        .start({ condition: () => !triggered && !gameStore.props.lastItemRevealed })
                        .do(this.getCommands(RevealAllSettings).showControlCommand(true))
                        .do(this.getCommands(PricePointSelector).showCommand(true))
                        .do(this.getCommands(UIControls).showControlCommand([UIControls.BTN_SETTINGS]))
                        .end()
                        .start({ condition: () => !triggered && gameStore.props.lastItemRevealed })
                        .do(this.getCommands(PricePointSelector).showCommand(true))
                        .end()
                        .end(),
                );
            },
            { fireImmediately: false },
        );

        //Reaction used when winTotal value got changed, so that we update the footer accordingly
        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_win",
            () => gameStore.props.winTotal,
            (value: number) => {
                this.run(
                    new SequenceDefinition()
                        .start()
                        .do(this.getCommands(FooterSettings).populateCommand(value))
                        .end(),
                );
            },
            { fireImmediately: true },
        );

        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_infoButtonPressed",
            () => gameStore.props.infoButtonPressed,
            (enabled: boolean) => {
                this.run(
                    new SequenceDefinition()
                        .start({ condition: () => enabled })
                        .do(this.getCommands(MarketingScreenSettings).showCommand())
                        .end(),
                );
            },
            { fireImmediately: false },
        );

        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_lastItemRevealed",
            () => gameStore.props.lastItemRevealed,
            (revealed: boolean) => {
                this.run(
                    new SequenceDefinition()
                        .start({ condition: () => revealed })
                        .do(this.getCommands(RevealAllSettings).enableControlCommand(false))
                        .do(this.getCommands(RevealAllSettings).showControlCommand(false))
                        .do(this.getCommands(IWHelpPaytableControl).enableHelpAndPaytableCommand(false))
                        .end(),
                );
            },
            { fireImmediately: false },
        );

        this._mobxUtils.addReaction(
            "DefaultEffectsHandler_revealAllControlEnabled",
            () => gameStore.props.revealAllControlEnabled,
            (controlEnabled: boolean) => {
                this.run(
                    new SequenceDefinition()
                        .start()
                        .start({ condition: () => controlEnabled })
                        .do(this.getCommands(RevealAllComponent).enableControlCommand(true))
                        .end()
                        .start({ condition: () => !controlEnabled })
                        .do(this.getCommands(RevealAllComponent).enableControlCommand(false))
                        .end()
                        .end(),
                );
            },
            { fireImmediately: false },
        );
    }

    // SEQUENCES //////////////////////////////////////////////////////////////////////////////
    moveToMoney(): SequenceDefinition {
        const iwProps = this.getProps(IWStore);
        return new SequenceDefinition()
            .start()
            .do(this.getCommands(GameUIControls).enableControlCommand([GameUIControls.BTN_BUY], false)) //disable the buy button, since reinit GameInInitial will get called to re-enable it
            .do(this.getCommands(GameUIControls).buyButtonHighlightCommand(false)) //disable highlight for now
            .do(this.getCommands(PricePointSelector).disableCommand())
            .do(IWProxyService.getCommands().gameReInitCommand())
            .do(this.getCommands(ResultSettings).hideCommand())
            .do(this.getCommands(GameUIControls).setUpCommand(iwProps.wagerType))
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_MOVE_TO_MONEY_PROMPT]))
            .do(this.getCommands(GameUIControls).hideControlCommand([GameUIControls.BTN_PLAY]))
            .do(this.getCommands(GameUIControls).showControlCommand([GameUIControls.BTN_BUY]))
            .do(this.getCommands(PricePointSelector).showCommand(true)) //before is showAndEnableCommand
            .do(this.getCommands(SubGame).resetCommand())
            .do(this.getCommands(GameUIControls).buyCommand(null), { blocking: true })
            .end();
    }
}
