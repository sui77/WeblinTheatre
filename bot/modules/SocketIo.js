const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'socket.io'});

class SocketIo {
    constructor(registry) {
        this.registry = registry;
        this.config = registry.get('config');
        this.io = null;
    }

    start() {
        var self = this;
        log.info('Starting socket.io server on port ' + this.config.get('socketIoPort'))
        this.io = require('socket.io')({path: "/wws"});
        this.io.listen(this.config.get('socketIoPort'));


        this.io.on('connection', async function (socket) {

            socket.account = null;

            log.info('Connection from ' + socket.request.headers['x-forwarded-for']);

            socket.on('test', require('./SocketIo/test.js')(self.registry, log, socket)) ;



        });
    }
}

module.exports = SocketIo;