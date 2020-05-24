const Screenplay = require('../Screenplay.js');
const Lms = require('../../library/Lms.js');

module.exports = function (options) {
    let registry = options.registry;
    screenPlays = {};
    screenPlayId = 0;

    return async function (ctx, next) {
        try {


            let method = ctx.request.body.method;
            let params = ctx.request.body.params;

            switch (method) {

                case 'test':
                    console.log("TEST");
                    break;

                case 'play':
                    id = ++screenPlayId;
                    let sp = screenPlays[id] = new Screenplay(registry);
                    sp.setCode(params.script)
                        .setId(screenPlayId)
                        .setRoom(params.room)
                        .onFinish((id) => {
                            delete screenPlays[id];
                            console.log('YOOO' + id);
                        })
                        .start();
                    body = JSON.stringify({spId: id, id: ctx.request.body.id});
                    break;

                case 'stop':
                    if (typeof screenPlays[ params.spId ] != "undefined") {
                        screenPlays[ params.spId ].stop();
                    }
                    body = JSON.stringify({status: 1, id: ctx.request.body.id});
                    break;

                case 'status':
                    if (typeof screenPlays[ params.spId ] != "undefined") {
                        body = JSON.stringify({status: 1, id: ctx.request.body.id});
                    } else {
                        body = JSON.stringify({status: 0, id: ctx.request.body.id});
                    }
                    break;

                default:
                    console.log("undefined method :" + method);
                    break;
            }

            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Content-type', 'application/json');
            ctx.response.body = body;
            ctx.response.status = 200;

        } catch (e) {
            ctx.response.status = 500;
            ctx.response.body = "500 Internal Server Error (" + e.message + ")";
        }
        await next();
    }
};

