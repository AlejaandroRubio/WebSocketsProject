"use strict";
(function () {
    let ws;
    const HEARBEAT_TIMEOUT = (1000 * 5) + (1000 * 1);
    const HEARBEAT_VALUE = 69;
    const messages = document.getElementById('messages');
    const wsOpen = document.getElementById('ws-open');
    const wsClose = document.getElementById('ws-close');
    const wsSend = document.getElementById('ws-send');
    const wsInput = document.getElementById('ws-input');
    function showMessage(message) {
        if (!messages) {
            return;
        }
        messages.textContent += `\n${message}`;
        messages.scrollTop = messages === null || messages === void 0 ? void 0 : messages.scrollHeight;
    }
    function closeConnection() {
        if (!!ws) {
            ws.close();
        }
    }
    function heartbeat() {
        if (!ws) {
            return;
        }
        else if (!!ws.pingTimeout) {
            clearTimeout(ws.pingTimeout);
        }
        ws.pingTimeout = setTimeout(() => {
            ws.close();
        }, HEARBEAT_TIMEOUT);
        const data = new Uint8Array(1);
        data[0] = HEARBEAT_VALUE;
        ws.send(data);
    }
    function isBinary(obj) {
        return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Blob]';
    }
    wsOpen.addEventListener('click', () => {
        closeConnection();
        ws = new WebSocket('ws://localhost:3000');
        ws.addEventListener('error', () => {
            showMessage('WebSocket error');
        });
        ws.addEventListener('open', () => {
            showMessage('WebSocket connection established');
        });
        ws.addEventListener('close', () => {
            showMessage('WebSocket connection closed');
            if (!!ws.pingTimeout) {
                clearTimeout(ws.pingTimeout);
            }
        });
        ws.addEventListener('message', (msg) => {
            if (isBinary(msg.data)) {
                heartbeat();
            }
            else {
                showMessage(`Received message: ${msg.data}`);
            }
        });
    });
    wsClose.addEventListener('click', closeConnection);
    wsSend.addEventListener('click', () => {
        const val = wsInput === null || wsInput === void 0 ? void 0 : wsInput.value;
        if (!val) {
            return;
        }
        else if (!ws) {
            showMessage('No WebSocket connection');
            return;
        }
        ws.send(val);
        showMessage(`Sent "${val}"`);
        wsInput.value = '';
    });
})();
