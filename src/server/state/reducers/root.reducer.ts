import { combineReducers, Reducer } from "redux";
import { gameStateReducer, GameState } from "./game-state.reducer";
import { actionTrackerReducer } from "./action-tracker.reducer";
import { GameAction } from "dci-game-server";

export interface State {
    gameState: GameState,
    lastAction: GameAction
}

export const rootReducer: Reducer<State, GameAction> = combineReducers<State, GameAction>({
    gameState: gameStateReducer,
    lastAction: actionTrackerReducer
});