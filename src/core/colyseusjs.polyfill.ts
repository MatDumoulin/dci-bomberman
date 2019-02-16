// This code is needed in order to use colyseus client on nodejs.
// It is needed to bypass the fact that colyseus client is meant to run in a browser.
// This way we don't get an error in TypeScript saying WebSocket is not a defined property on global
const globalAny: any = global;
globalAny.WebSocket = require('ws');
globalAny.window = {
    localStorage: {
        getItem: () => {},
        setItem: () => {}
    }
};
