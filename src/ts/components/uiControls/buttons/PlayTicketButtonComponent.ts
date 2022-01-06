import { ParentDef, Button } from "playa-core";
import { IWProps, UIActions } from "playa-iw";

/**
 * Play Ticket button component
 */
export class PlayTicketButtonComponent extends Button {
    public actions: UIActions;

    constructor(parentActions: UIActions) {
        super();

        this.actions = parentActions;
    }
}
