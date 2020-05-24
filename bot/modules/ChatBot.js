const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'ChatBot'});
const {client, xml} = require("@xmpp/client");
const debug = require("@xmpp/debug");

class ChatBot {

    constructor(registry, username) {
        this.registry = registry;
        this.config = registry.get('config');

        this.username = username;
        this.nickname = username;
        this.avatarUrl = 'none';
        this.password = require('crypto').createHash('sha1').update('3b6f88f2bed0f392' + this.username).digest('hex');

        this.jid = username + '@' + config.get('xmpp').domain;

    }

    kill() {
        this.xmpp.stop();
    }

    setNickname(name) {
        this.nickname = name;
        return this;
    }

    setAvatarUrl(url) {
        this.avatarUrl = url;
        return this;
    }

    start() {
        return new Promise( (resolve, reject) => {
            log.info("[" + this.username + "] Initializing");

            let config = this.config.get('xmpp');
            config.username = this.username;
            config.password = this.password;

            let xmpp = this.xmpp = client(config);


            xmpp.on("status", (status) => { });
            xmpp.on("error", (error) => this.xmppOnError(this, error));
            xmpp.on("online", () => {
                log.info("[" + this.username + "] Online");
                resolve()
            } );
            xmpp.on("offline", this.xmppOnOffline);
            xmpp.on("stanza", this.xmppOnStanza);

            xmpp.on("element", (msg) => this.xmppLog(this, 'IN: ' + msg));
            xmpp.on("send", (msg) => this.xmppLog(this, 'OUT: ' + msg));


            xmpp.start();

       });
    }

    xmppLog(ctx, msg) {
        if (this.config.get('settings.logXMPP')) {
            log.info("[" + ctx.username + "] IN: " + msg);
        }
    }

    async xmppOnError(ctx, err) {
        log.error("[" + ctx.username + "] " + err.message);
    }

    async xmppOnOnline(ctx) {
        log.info("[" + ctx.username + "] online ");

    }

    async xmppOnOffline() {

    }

    async xmppOnStanza() {

    }

    async say(room, msg) {
        let message = xml("message", {
            to: room,
            from: this.jid,
            type: 'groupchat',

        }).append( xml("body").append(msg));
        await this.xmpp.send(message);
    }

    async move(room, x) {
        let presence = xml("presence", {
            to: room + "/bot_" + this.username
        }).append(
            xml("x", {
                xmlns: "firebat:user:identity",
                jid: this.jid,
                src: this.config.get('location.webserver') + "/identity/" +  this.username + ".xml",
            })
        ).append(
            xml("x", {
                    xmlns: "firebat:avatar:state",
                    jid: this.jid,
                }
            ).append(
                xml("position", {x: x})
            )
        );
        await this.xmpp.send(presence);
    }

    async leave(room, x) {
        //<presence id='2606ffd47c95' type='unavailable' to='2883fcb56d5ac9d5e7adad03a38bce8a362dbdc2@muc4.virtual-presence.org/Sui'/>
        let presence = xml("presence", {
            to: room + '/bot_' + this.username,
            type: 'unavailable'
        });
        await this.xmpp.send(presence);
    }

}

module.exports = ChatBot;