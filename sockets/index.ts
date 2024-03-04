import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";


const HEARBEAT_INTERVAL = 1000 * 5;

const HEARBEAT_VALUE= 69;

function onSocketPreError(e: Error) {
    console.log(e);
}

function onSocketPostError(e: Error) {
    console.log(e);
}

function ping(ws:WebSocket){
    ws.send(HEARBEAT_VALUE,{binary: true})
}

export default function configure (s:Server){

    const wss = new WebSocketServer({ noServer: true });

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
    ws.isAlive = true

    ws.on('error', onSocketPostError);

    ws.on('message', (msg, isBinary) => {
        if(isBinary && (msg as any)[0] === HEARBEAT_VALUE){
            ws.isAlive= true
            console.log('pong');

        }else{
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg, { binary: isBinary });
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Connection closed');
    });
});

const Interval = setInterval(()=>{

    wss.clients.forEach((client) => {
        if(!client.isAlive){
            client.terminate();
            return;
        }
        client.isAlive= false
        ping(client);

    });

},HEARBEAT_INTERVAL);
wss.on('close',()=>{
    clearInterval(Interval);
});

}