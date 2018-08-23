import { Action } from "redux";
import { Bomb, PlayerId, PlayerMove } from "../../models";

/** Contains all of the actions that can be performed in the bomberman game. */
export const JOIN_GAME = "[User] Wants to join the game";
export const GAME_JOINED = "[User] Joined the game";

export const LEAVE_GAME = "[User] Wants to leave the game";
export const GAME_LEFT = "[User] Left the game";

export const PAUSE_GAME = "[User] Wants to pause the game";
export const GAME_PAUSED = "[User] Game is paused";

export const RESUME_GAME = "[User] Wants to resume the game";
export const GAME_RESUMED = "[User] Game is resumed";

export const UPDATE_MOVEMENT = "[Player] Has changed the way he's moving";

// User has a bomb limit. This limit changes with collectible.
export const PLANT_BOMB = "[Player] Wants to plant a bomb";
export const BOMB_PLANTED = "[Player] Planted a bomb";
export const BOMB_EXPLODED = "[Bomb] Has exploded";

export const PLAYER_DAMAGED = "[Player] Has been hit by a bomb";
export const PLAYER_DIED = "[Player] Is dead";

// Action class implementation
export class JoinGame implements Action {
  readonly type = JOIN_GAME;

  constructor(public payload: PlayerId) {}
}

export class GameJoined implements Action {
  readonly type = GAME_JOINED;

  constructor(public payload: PlayerId) {}
}

export class LeaveGame implements Action {
  readonly type = LEAVE_GAME;

  constructor(public payload: PlayerId) {}
}

export class GameLeft implements Action {
  readonly type = GAME_LEFT;

  constructor(public payload: PlayerId) {}
}

export class PauseGame implements Action {
  readonly type = PAUSE_GAME;
}

export class GamePaused implements Action {
  readonly type = GAME_PAUSED;
}

export class ResumeGame implements Action {
  readonly type = RESUME_GAME;
}

export class GameResumed implements Action {
  readonly type = GAME_RESUMED;
}

export class UpdateMouvement implements Action {
  readonly type = UPDATE_MOVEMENT;

  constructor(public payload: PlayerMove) {}
}

export class PlantBomb implements Action {
  readonly type = PLANT_BOMB;

  constructor(public payload: PlayerId) {}
}

export class BombPlanted implements Action {
  readonly type = BOMB_PLANTED;

  constructor(public payload: Bomb) {}
}

export class BombExploded implements Action {
  readonly type = BOMB_EXPLODED;

  constructor(public payload: Bomb) {}
}

export class PlayerDamaged implements Action {
  readonly type = PLAYER_DAMAGED;

  constructor(public payload: PlayerId) {}
}

export class PlayerDied implements Action {
  readonly type = PLAYER_DIED;

  constructor(public payload: PlayerId) {}
}

export type BombermanAction =
  | JoinGame
  | GameJoined
  | LeaveGame
  | GameLeft
  | PauseGame
  | GamePaused
  | ResumeGame
  | GameResumed
  | UpdateMouvement
  | PlantBomb
  | BombPlanted
  | BombExploded
  | PlayerDamaged 
  | PlayerDied;
