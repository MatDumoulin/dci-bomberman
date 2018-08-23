export interface Move {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
}

export interface PlayerMove {
    playerId: string;
    move: Move;
}