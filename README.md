# BombermanServer

This is a game server for a custom version of bomberman. This game is meant to be played by bots or AI through web sockets.

## To get started

Before you begin, this game server uses **Redis** to allow vertical scaling. Thus, a Redis instance must first be available in order to use the server. By default, the server expects the Redis instance to run on _localhost:6379_. You can change the expected location of the Redis instance on the _src/global.config.ts_ file. You will then need to compile the server and restart it.

To run the server, you must first transpile(compile) the TypeScript code into JavaScript with `npm run build`. Then, on another command line, you can run the load balancer with the `npm run load-balancer` command and the server with the `npm start` command.

The load balancer must be up at all time since this is how the players/viewers can join a game. It allows to connect multiple server to reduce the load on the infrastructure.

### How can I create/delete a game?

This server handles the game creation/deletion automatically. In order to create a game, a player/viewer must connect to the server. If this user is not able to join an existing game (all games are full, there are no existing game at the moment, etc.), a new game will be created automatically for him. Once a game is empty (no one is playing or viewing), the game instance will automatically be disposed.

### Ok, now I want to start my game. How can I do it?

First of all, when a game contains 4 players, it will automatically start. If your game is not full and you want to start it, you can enter `start` at any time in the command line that is running the server. Bots will be spawned to fill up the room and the game will automatically start.

### How to change the port used by the server

By default, the port used will be displayed in the terminal once the server is up and running. To change it, update the ports and host names in the _src/global.config.ts_ file to match your current infrastructure.

## Now that everything is set up, how can I view a game?

The web server to view a game is on [a separate Git repository](https://github.com/kingbaub3/dci-bomberman-viewer).

## Help, the leaderboard is not working!

The leaderboard server needs to be started independently from the game server. To start the leaderboard server, run `npm run leaderboard` in a terminal. The leaderboard is on a separate server than the game servers to allow vertical scaling of the application and to lower the load on a single server. Due to my lazyness, it must run on the same server as the load balancer.

## For more information

This game server uses Colyseus, an awesome game server library. For more information on Colyseus, see [the official Colyseus Website](https://colyseus.io/).
