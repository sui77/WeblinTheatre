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

myBot = registry.get('botPool').get('sui');
myBot.setNickname("hoschi").setAvatarUrl('http://avatar.zweitgeist.com/gif/006/Che/config.xml');
myBot.start();
//let x = await lms('http://sui.li')
//console.log( x );
/*
        for (n = 50; n < 60; n++) {
            bot[n] = new Bot(registry)
            await bot[n].setCredentials('xmppjs' + n, 'testtest').start();
            let b = bot[n];
            // setInterval( () => { b.test() }, 1000);
            setTimeout(() => {
                b.joinExampleCom()
            }, 1000 * n);
        }
*/

    } catch (e) {
        console.log("Start failed: " + e.message);
        process.exit();
    }
}
