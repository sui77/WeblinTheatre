const fs = require("fs");
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'config'});

class Config {
    constructor(registry) {
        this.registry = registry;
        this.config = {};
    }

    get(key, obj) {
        if (typeof obj == 'undefined') {
            obj = this.config;
        }
        const split = key.split('.');
        const currKey = split.shift();
        if (split.length == 0) {
            return obj[currKey];
        } else {
            return this.get(split.join('.'), obj[currKey]);
        }
    }

    async load() {
        try {
            let env = process.env.NODE_ENV || "dev";
            if (typeof env == 'undefined') {
                env = 'dev';
            }
            const config = await fs.readFileSync(__dirname + '/../config/config.' + env + '.json');
            this.config = JSON.parse(config);
            this.config.env = env;
        } catch (e) {
            throw new Error(e.message + ' (' + __filename + ')');
        }
    }

}

module.exports = Config;