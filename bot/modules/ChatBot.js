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
        this.password = require('crypto').createHash('sha1').update(this.username).digest('hex');

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

    async start() {
        log.info("[" + this.username + "] Initializing");

        let config = this.config.get('xmpp');
        config.username = this.username;
        config.password = this.password;

        let xmpp = this.xmpp = client(config);


        xmpp.on("status", (status) => {});
        xmpp.on("error", (error) => this.xmppOnError(this, error));
        xmpp.on("online", this.xmppOnOnline);
        xmpp.on("offline", this.xmppOnOffline);
        xmpp.on("stanza", this.xmppOnStanza);

        xmpp.on("element", (msg) => this.xmppOnIncoming(this, msg));
        xmpp.on("send", (msg) => this.xmppOnOutgoing(this, msg));


        await xmpp.start().catch((msg) => log.error(msg));
        log.info("[" + this.username + "] Connected");
    }

    xmppOnIncoming(foo, msg) {
        //log.info("[" + this.username + "] IN: " + msg);
    }

    xmppOnOutgoing(foo, msg) {
        //log.info("[" + this.username + "] OUT: " + msg);
    }

    async xmppOnError(err) {
        log.error("[" + this.username + "] " + err.message);
    }

    async xmppOnOnline() {

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
        //<message xml:lang="de"><body>hello world</body></message>

    }

    async join(room, x) {
        log.info("[" + this.username + "] Joining " + room);

        let presence = xml("presence", {
            to: room + "/bot_" + this.username
        });
        await this.xmpp.send(presence);


        presence = xml("presence", {
           // id: "d5df5eff17de",
            to: room + "/bot_" + this.username
        }).append(
            xml("x", {
                xmlns: "http://jabber.org/protocol/muc",
            }).append(
                xml("history", {
                    maxchars: 0,
                    maxstanzas: 0,
                })
            )
        ).append(
            xml("x", {
                xmlns: "firebat:user:identity",
                // id: "id:sui:2:" + this.username,
                jid: this.jid,
                src: "https://weblin.sui.li/identity/" + this.username + ".xml",
            })
        ).append(
            xml("x", {
                    xmlns: "firebat:avatar:state",
                    //  id: "id:sui2:" + this.username,
                        jid: this.jid,
                }
            ).append(
                xml("position", {x: x})
            )
        );
        await this.xmpp.send(presence);
    }

    async jumpTo(room, x) {
        let presence = xml("presence", {
           // id: "d5df5eff17de",
            to: room + "/bot_" + this.username
        }).append(
            xml("x", {
                xmlns: "firebat:user:identity",
                // id: "id:sui:2:" + this.username,
                jid: this.jid,
                src: "https://weblin.sui.li/identity/" + this.username + ".xml",
            })
        ).append(
            xml("x", {
                    xmlns: "firebat:avatar:state",
                    //  id: "id:sui2:" + this.username,
                        jid: this.jid,
                }
            ).append(
                xml("position", {x: x})
            )
        );
        await this.xmpp.send(presence);
    }


    async test() {
        let iq = xml("iq", {
            to: "64901854@xmpp1.zweitgeist.com/zg_fa6048d2b350",
            type: "set",
            from: "platform@xmpp1.zweitgeist.com",
            id: "wtf"

        }).append(
            xml("query", {
                    xmlns: "jabber:iq:rpc",
                }
            ).append(xml("methodCall", {})
                .append(xml("methodName", {}).append("Main.LoadIdentity")))
        )
        await this.xmpp.send(iq);
console.log(iq.toString());
        //<iq from='platform@xmpp1.zweitgeist.com' to='64901854@xmpp1.zweitgeist.com/zg_fa6048d2b350' type='set'><query xmlns='jabber:iq:rpc'><methodCall><methodName>Main.LoadIdentity</methodName><params/></methodCall></query></iq>
    }

    async joinExampleCom() {

        log.info("[" + this.username + "] Joining example.com");

        let presence = xml("presence", {
            //  id: "d5df5eff17de",
            to: "465806fbb3547c258cfa20becfef6e08f41c233b@muc4.virtual-presence.org/bot_" + this.username
        });
        await this.xmpp.send(presence);


        presence = xml("presence", {
            id: "d5df5eff17de",
            to: "465806fbb3547c258cfa20becfef6e08f41c233b@muc4.virtual-presence.org/bot_" + this.username
        }).append(
            xml("x", {
                xmlns: "http://jabber.org/protocol/muc",
            }).append(
                xml("history", {
                    maxchars: 0,
                    maxstanzas: 0,
                })
            )
        ).append(
            xml("x", {
                xmlns: "firebat:user:identity",
                // id: "id:sui:2:" + this.username,
                jid: this.username + "@jitsi.sui.li",
                src: "https://weblin.sui.li/identity/" + this.username + ".xml",
            })
        ).append(
            xml("x", {
                    xmlns: "firebat:avatar:state",
                    //  id: "id:sui2:" + this.username,
                        jid: this.username + "@jitsi.sui.li",
                }
            ).append(
                xml("position", {x: 464})
            )
        );
        await this.xmpp.send(presence);
    }
}

module.exports = ChatBot;