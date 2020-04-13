const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'socket.io'});
const Bot = require('./ChatBot.js');

class ChatBotPool {

    constructor(registry) {
        this.registry = registry;
        this.pool = [];
    }

    get(username) {
        if (typeof username == 'undefined') {
            username = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.pool[username] = new Bot(this.registry, username);
        } else if (typeof this.pool[username] == 'undefined') {
            this.pool[username] = new Bot(this.registry, username);
        }
        console.log("GET BOT " + username);
        return this.pool[username];
    }

    kill(username) {
        if (typeof this.pool[username] != 'undefined') {
            this.pool[username].kill();
            delete this.pool[username];
        }
    }

    exists(username) {
        return typeof this.pool[username] != 'undefined';
    }

}

module.exports = ChatBotPool;