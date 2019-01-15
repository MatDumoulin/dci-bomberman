# BombermanServer
This is a game server for a custom version of bomberman. This game is meant to be played by bots or AI through web sockets. 

## To get started
Before you begin, this game server uses **Redis** to allow vertical scaling. Thus, a Redis instance must first be available in order to use the server. By default, the server expects the Redis instance to run on *localhost:6379*. You can change the expected location of the Redis instance on the *src/global.config.ts* file. You will then need to compile the server and restart it.

To run the server, you must first transpile(compile) the TypeScript code into JavaScript with `npm run build`. Then, on another command line, you can run the server with the `npm start` command.

### How can I create/delete a game?
This server handles the game creation/deletion automatically. In order to create a game, a player/viewer must connect to the server. If this user is not able to join an existing game (all games are full, there are no existing game at the moment, etc.), a new game will be created automatically for him. Once a game is empty (no one is playing or viewing), the game instance will automatically be disposed.

### Ok, now I want to start my game. How can I do it? 
First of all, when a game contains 4 players, it will automatically start. If your game is not full and you want to start it, you can enter start at any time in the command line that is running the server. Bots will be spawned to fill up the room and the game will automatically start.

### How to change the port used by the server
By default, the port used will be displayed in the terminal once the server is up and running. To change it, go on the package.json file, then update the *--port* attribute of the scripts->server section. Note that the *--server* attribute of the scripts->server section must be updated in order to spawn bots when needed.

## Now that everything is set up, how can I view a game?
The web server to view a game is on [a separate Git repository](https://github.com/kingbaub3/dci-bomberman-viewer).

## Help, the leaderboard is not working!
The leaderboard server needs to be started independently from the game server. To start the leaderboard server, run `npm run leaderboard` in a terminal. The leaderboard is on a separate server to allow vertical scaling of the application and to lower the load on a single server.

## For more information
This game server uses Colyseus, a game server library. For more information on Colyseus, see [the official Colyseus Website](https://colyseus.io/).
