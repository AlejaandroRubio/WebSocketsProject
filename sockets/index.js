"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const HEARBEAT_INTERVAL = 1000 * 5;
const HEARBEAT_VALUE = 69;
function onSocketPreError(e) {
    console.log(e);
}
function onSocketPostError(e) {
    console.log(e);
}
function ping(ws) {
    ws.send(HEARBEAT_VALUE, { binary: true });
}
function configure(s) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    s.on('upgrade', (req, socket, head) => {
        socket.on('error', onSocketPreError);
        // perform auth
        if (!!req.headers['BadAuth']) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketPreError);
            wss.emit('connection', ws, req);
        });
    });
    wss.on('connection', (ws, req) => {
        ws.isAlive = true;
        ws.on('error', onSocketPostError);
        ws.on('message', (msg, isBinary) => {
            if (isBinary && msg[0] === HEARBEAT_VALUE) {
                ws.isAlive = true;
                console.log('pong');
            }
            else {
                wss.clients.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(msg, { binary: isBinary });
                    }
                });
            }
        });
        ws.on('close', () => {
            console.log('Connection closed');
        });
    });
    const Interval = setInterval(() => {
        wss.clients.forEach((client) => {
            if (!client.isAlive) {
                client.terminate();
                return;
            }
            client.isAlive = false;
            ping(client);
        });
    }, HEARBEAT_INTERVAL);
    wss.on('close', () => {
        clearInterval(Interval);
    });
}
exports.default = configure;
