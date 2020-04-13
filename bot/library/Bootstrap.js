const Config = require('../library/Config.js');

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'bootstrap'});


module.exports = async function (registry) {
    try {

        log.info('Init config');
        const config = new Config(registry);
        await config.load();
        registry.add('config', config);

        log.info('Init redis');
        const redis = require('redis-promisify');
        const client = redis.createClient(config.get('redis'));
        client.on('error', function (e) {
            throw (new Error(e.message));
        });
        registry.add('redis', client);

        log.info('Init BotPool');
        const botPool = require('../modules/ChatBotPool.js');
        registry.add('botPool', new botPool(registry));

    } catch (e) {
        log.error(e.message);
        throw(e);
    }
}