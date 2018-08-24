import { Action } from "redux";
import { Bomb, PlayerId, PlayerMove } from "../../models";
import { GameAction } from "dci-game-server";

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
export class JoinGame {
  static create(payload: PlayerId): GameAction {
    return {
      type: JOIN_GAME,
      payload
    };
  }
}

export class GameJoined {
  static create(payload: PlayerId): GameAction {
    return {
      type: GAME_JOINED,
      payload
    };
  }
}

export class LeaveGame {
  static create(payload: PlayerId): GameAction {
    return {
      type: LEAVE_GAME,
      payload
    };
  }
}

export class GameLeft {
  static create(payload: PlayerId): GameAction {
    return {
      type: GAME_LEFT,
      payload
    };
  }
}

export class PauseGame {
  static create(): GameAction {
    return {
      type: PAUSE_GAME
    };
  }
}

export class GamePaused {
  static create(): GameAction {
    return {
      type: GAME_PAUSED
    };
  }
}

export class ResumeGame {
  static create(): GameAction {
    return {
      type: RESUME_GAME
    };
  }
}

export class GameResumed {
  static create(): GameAction {
    return {
      type: GAME_RESUMED
    };
  }
}

export class UpdateMouvement {
  static create(payload: PlayerMove): GameAction {
    return {
      type: UPDATE_MOVEMENT,
      payload
    };
  }
}

export class PlantBomb {
  static create(payload: PlayerId): GameAction {
    return {
      type: PLANT_BOMB,
      payload
    };
  }
}

export class BombPlanted {
  static create(payload: Bomb): GameAction {
    return {
      type: BOMB_PLANTED,
      payload
    };
  }
}

export class BombExploded {
  static create(payload: Bomb): GameAction {
    return {
      type: BOMB_EXPLODED,
      payload
    };
  }
}

export class PlayerDamaged {
  static create(payload: PlayerId): GameAction {
    return {
      type: PLAYER_DAMAGED,
      payload
    };
  }
}

export class PlayerDied {
  static create(payload: PlayerId): GameAction {
    return {
      type: PLAYER_DIED,
      payload
    };
  }
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
