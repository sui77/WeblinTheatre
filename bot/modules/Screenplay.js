const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'Screenplay'});
const _ = require('lodash');

status = {
    idle: 0,
    running: 1,
    stopped: 2,
}

systemCommands = {
    pause: (params) => {
        let ms = Math.round(params.value * 1000);
        log.info("Pause " + ms);
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

characterCommands = {
    avatar: async (character, value) => {
        character.setAvatarUrl(value.value);
    },
    move: async (character, value) => {
        character.move(value.room, value.value);
    },
    say: async (character, value) => {
        character.say(value.room, value.value);
    },
    leave: async (character, value) => {
        character.leave(value.room);
    }
};


class Screenplay {

    constructor(registry) {
        this.registry = registry;
        this.config = registry.get('config');
        this.code = [];
        this.characters = {};
        this.room = 'test@bot.jitsi.sui.li';
    }

    async getCharacter(name) {
        log.info("getCharacter " + name);
        if (!_.has(this.characters[name], 'bot')) {
            this.characters[name].bot = this.registry.get('botPool').get();
            this.characters[name].bot.setNickname(name);
            await this.characters[name].bot.start();
        }

        return this.characters[name].bot;
    }

    setRoom(room) {
        this.room = room;
        return this;
    }

    setCode(code) {
        let aCode = code.split(/\n/);
        let errors = [];
        for (let n in aCode) {
            let line = aCode[n].trim();

            let characterCommand = line.match(/^([A-Za-z0-9]*?)\.([a-z]*)\s+(.*?)(\s+[0-9]{1,3}|$)/);
            let systemCommand = line.match(/^(pause|#)(\s+.*|)/);

            if (characterCommand !== null) {
                this.characters[characterCommand[1]] = {}

                if (!_.has(characterCommands, characterCommand[2])) {
                    errors.push({line: n, msg: "Unknown command " + characterCommand[2], match: characterCommand});
                } else {
                    this.code.push({
                        character: characterCommand[1],
                        command: characterCommand[2],
                        value: characterCommand[3],
                        delay: characterCommand[4] * 1,
                        raw: line
                    });
                }
            } else if (systemCommand !== null) {
                this.code.push({
                    command: systemCommand[1],
                    value: systemCommand[2].trim(),
                    raw: line
                });
            } else {
                this.code.push({
                    command: 'invalid',
                    raw: line
                });
            }

        }
        log.info(errors);
        log.info(this.characters);
        return this;
    }

    onFinish(func) {
        this.triggerOnFinish = func;
        return this;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    start() {
        this.status = status.running;
        this.run(0);
        return this;
    }

    stop() {
        this.status = status.stopped;
    }

    finalize() {
        for (let n in this.characters) {
            this.registry.get('botPool').kill(this.characters[n].bot.username);
            log.info("Kill " + this.characters[n].bot.username);
        }
        this.characters = {};
        if (this.triggerOnFinish) {
            this.triggerOnFinish(this.id);
        }
    }

    async run(step) {
        log.info("Step " + step);
        if (this.status == status.stopped) {
            this.finalize();
            return;
        }

        if (this.code.length > step) {
            let currentStep = this.code[step];
            currentStep.room = this.room;
            let delay = 100;
            if (_.has(characterCommands, currentStep.command)) {
                let character = await this.getCharacter(currentStep.character);
                await characterCommands[currentStep.command](character, currentStep);
                log.error(_.get(currentStep, 'delay', 0));
                await systemCommands['pause']({value: _.get(currentStep, 'delay', 0)});
            } else if (_.has(systemCommands, currentStep.command)) {
                await systemCommands[currentStep.command](currentStep);
            } else {

            }
            this.run(step + 1);

        } else {
            this.finalize();
            return;
        }
    }


}

module.exports = Screenplay;