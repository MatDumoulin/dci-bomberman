
// This way we don't get an error in TypeScript saying WebSocket is not a defined property on global
const globalAny: any = global;
globalAny.WebSocket = require('ws');
globalAny.window = {
    localStorage: {
        getItem: () => {},
        setItem: () => {}
    }
};
