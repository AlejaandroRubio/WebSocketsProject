import express from 'express';
import configure from './routers';
import configureSockets from './sockets'

const app = express();
const port = process.env.PORT || 3000;

function onSocketPreError(e: Error) {
    console.log(e);
}

function onSocketPostError(e: Error) {
    console.log(e);
}

configure(app);

console.log(`Attempting to run server on port ${port}`);

configureSockets(app.listen(port, () => {
    console.log(`Listening on port ${port}`);
}));

