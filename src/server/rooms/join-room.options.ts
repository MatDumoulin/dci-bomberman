export interface JoinRoomOptions {
    isPlaying: boolean;
    /** The original id given by colyseus. */
    clientId: string;
    sessionId: string;
    /** The id that is used in the game state for the given player. It only has a value if the user is playing.*/
    playerId?: string;
}
