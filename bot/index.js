const SocketIo = require('./modules/SocketIo.js');
const WebServer = require('./modules/WebServer.js');
const registry = require('./library/Registry.js');
const Bootstrap = require('./library/Bootstrap');
const Bot = require('./modules/ChatBot.js');

const lms = require('./library/Lms.js');


const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'main'});

start();
bot = [];

async function start() {
    try {
        await Bootstrap(registry);

        const config = registry.get('config');

        // Socket.io Server
        const sio = new SocketIo(registry);
        registry.add('io', sio);
        sio.start();

        // ApiServer
        const koa = new WebServer(registry);
        koa.start();

    } catch (e) {
        console.log("Start failed: " + e.message);
        process.exit();
    }
}
