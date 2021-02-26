const Screenplay = require('../Screenplay.js');
const Lms = require('../../library/Lms.js');
const fs = require("fs");
const bent = require('bent');
const url = require('url');

var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-central-1'});

const s3 = new AWS.S3();


module.exports = function (options) {
    let registry = options.registry;
    screenPlays = {};
    screenPlayId = 0;

    function saveContent(context, text) {
        return new Promise((resolve, reject) => {
            let contextObj;
            try {
                contextObj = JSON.parse(Buffer.from(context, 'base64'));
            } catch (e) {
                reject(e);
            }

            console.log( contextObj );
            if (contextObj.payload.item.match(/[^a-z0-9]/)) {
               reject(new Error('invalid name'));
            }

            s3.upload({Bucket: 'weblintheatre', Key: contextObj.payload.item, Body: text}, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                if (data) {
                    resolve(data.Location);
                }
            });
        });
    }

    function getContent(context) {
        return new Promise((resolve, reject) => {
            let contextObj;
            try {
                contextObj = JSON.parse(Buffer.from(context, 'base64'));
            } catch (e) {
                reject(err);
            }
console.log('get content');
            s3.getObject({Bucket: 'weblintheatre', Key: contextObj.payload.item}, function (err, data) {
                if (err) {
                    // @todo
                    resolve('');
                }
                if (data) {
                    console.log("B");
                    resolve(data.Body.toString('utf-8'));
                }
            });
        });

    }

    return async function (ctx, next) {
        try {


            let method = ctx.request.body.method;
            let params = ctx.request.body.params;

            switch (method) {

                case 'test':
                    console.log("TEST");
                    break;

                case 'load':

                    let content = await getContent(params.context);

//                    const code = await fs.readFileSync(__dirname + '/../../../public/examples/revolution.txt');
//                    body = JSON.stringify({status: 1, code: code.toString()});
                    body = JSON.stringify({status: 1, code: content});
                    break;

                case 'save':
                    console.log('SAVE');
                    console.log(params);
                    let save = await saveContent(params.context, params.script);
                    body = JSON.stringify({status: 1});
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
                    if (typeof screenPlays[params.spId] != "undefined") {
                        screenPlays[params.spId].stop();
                    }
                    body = JSON.stringify({status: 1, id: ctx.request.body.id});
                    break;

                case 'status':
                    if (typeof screenPlays[params.spId] != "undefined") {
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

