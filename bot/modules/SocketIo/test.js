const Screenplay = require('../Screenplay.js');
const Lms = require ('../../library/Lms.js');

module.exports = function (registry, log, socket) {

    redis = registry.get('redis');

    return async function (params, cb) {

        let sp = new Screenplay(registry, params.script);
        sp.parse();
        let room = await Lms(params.room);
        console.log( params.room, room );
        sp.setRoom(room);
        cb({success: true, account: "yup"});
        sp.run(0,0);


        return;
        const result = await redis.hgetAsync('alias2account', params.alias);
        if (result) {
            cb({success: true, account: result});
        } else {
            cb({success: false});
        }
    }
}