import { Command, ICommand, Button } from "playa-core";
import { TweenMax } from "gsap";
import { UIControls } from "playa-iw";

/**
 * Show control
 */
export class HideUIControlCommand extends Command implements ICommand {
    show: boolean;

    view: UIControls;

    buttonFadeDuration: number;

    tween: any;

    constructor(uiControls: UIControls, ids: string[], show: boolean, delay: number = 0) {
        super(ids);
        this.show = show;
        this.view = uiControls;
        this.buttonFadeDuration = delay;
    }

    execute() {
        super.execute();

        this.buttonFadeDuration = this.view.props.fadeDuration;

        this._payload.forEach((id: string) => {
            const button = this.view.subComponents.get(id) as Button;
            if (button !== undefined) {
                this.toggleButtonVisibility(button, this.show);
            }
        });

        this.resolveCompleted();
    }

    /**
     * Toggle Button Visibility
     * @param button
     * @param show
     */
    toggleButtonVisibility(button: Button, show: boolean) {
        TweenMax.to(button, this.buttonFadeDuration, {
            alpha: show ? 1 : 0,
            onStart: () => {
                if (show) {
                    button.visible = show;
                }
            },
            onComplete: () => {
                button.visible = show;
            },
        });
    }
}
