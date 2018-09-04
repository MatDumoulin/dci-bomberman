import { Subject, Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { PlayerAction } from "../../server/models";

/**
 * Stores the last actions of the user. If new actions are
 * given but they are the same as the previous one, this will
 * not notify subscribers of any change.
 */
export class ActionQueue {
    private _subject: Subject<PlayerAction>;

    constructor() {
        this._subject = new Subject();
    }

    cleanUp(): void {
        this._subject.complete();
    }

    getQueue(): Observable<PlayerAction> {
        return this._subject.pipe(
            distinctUntilChanged(
                (previous: PlayerAction, newValue: PlayerAction) => {
                    // Tests if all fields of the player action are the same.
                    // If not, the new player action will become the action in this queue.
                    return (
                        previous === newValue || // Tests if references are the same, as well as null actions.
                        previous.move_down === newValue.move_down &&
                        previous.move_up === newValue.move_up &&
                        previous.move_left === newValue.move_left &&
                        previous.move_right === newValue.move_right &&
                        previous.plant_bomb === newValue.plant_bomb
                    );
                }
            )
        );
    }

    set(newAction: PlayerAction): void {
        this._subject.next(newAction);
    }
}
