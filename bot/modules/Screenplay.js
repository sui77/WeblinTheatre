const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'Screenplay'});
const _ = require('lodash');

class Screenplay {


    constructor(registry, code) {
        this.registry = registry;
        this.config = registry.get('config');
        this.code = code;
        this.scenes = [[]];
        this.characters = {};
        this.room = 'test@bot.jitsi.sui.li';

        this.commands = {
            setAvatar: async (character, value) => {
                let c = await this.getCharacter(this, character);
                c.setAvatarUrl(value)
            },
            join: async (character, value) => {
                let c = await this.getCharacter(this, character);
                c.join(this.room, value);
            },
            jumpTo: async (character, value) => {
                let c = await this.getCharacter(this, character);
                c.jumpTo(this.room, value);

            },
            say: async (character, value) => {
                let c = await this.getCharacter(this, character);
                c.say(this.room, value);

            }

        };

    }

    async getCharacter(ctx, name) {
        console.log("GET CHARACTER");
        if (!_.has(this.characters[name], 'bot')) {
            ctx.characters[name].bot = ctx.registry.get('botPool').get();
            ctx.characters[name].bot.setNickname( name);
            await ctx.characters[name].bot.start();
        }

        return ctx.characters[name].bot;
    }

    setRoom(room) {
        this.room = room;
    }

    parse() {
        let aCode = this.code.split(/\n/);
        let nScene = 0;
        let errors = [];
        for (let n in aCode) {
            let line = aCode[n].trim();
            if (line.match(/^Scene/)) {
                nScene++; this.scenes.push([]);
            } else {
                let cmd = line.match(/^([A-Za-z0-9]*?)\.([a-zA-Z]*?) (.*)$/);
console.log(cmd);
                if (cmd !== null) {
                    if (cmd[1] != "System" && !_.has(this.characters, cmd[1])) {
                        this.characters[cmd[1]] = {}
                    }
                    if (cmd[1] != "System" && !_.has(this.commands, cmd[2])) {
                        errors.push("Unknown command " + cmd[2] + " in line " + n);
                    } else {
                        this.scenes[nScene].push( {
                            character: cmd[1],
                            command: cmd[2],
                            value: cmd[3]
                        });
                    }
                }
            }
            //log.info( cmd );
        }
        log.info(errors);
        log.info(this.characters);
        log.info(this.scenes);
    }



    start() {
        this.scene = 0;
        this.step = 0;
        this.run();
    }

    run(scene, step) {
        console.log("RUN " + scene + " " + step );
        if (this.scenes.length > scene) {
            let currentScene = this.scenes[scene];
            if (currentScene.length > step) {
                let currentStep = currentScene[step];
                console.log( currentStep.command);
                let delay = 100;
                if (currentStep.command == "pause") {
                    delay = currentStep.value;
                } else {
                    this.commands[currentStep.command](currentStep.character, currentStep.value);
                }
                setTimeout(() => { this.run(scene, step+1); }, delay);
            } else {
                this.run(scene+1, 0);
            }
        } else {
console.log( this.characters);
                for (let n in this.characters) {
                    this.registry.get('botPool').kill( this.characters[n].bot.username );
                    log.info("Kill " + this.characters[n].bot.username);
                }
                this.characters = {};
        }
    }


}

module.exports = Screenplay;