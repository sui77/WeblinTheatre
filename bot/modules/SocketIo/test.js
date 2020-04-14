const Screenplay = require('../Screenplay.js');
const Lms = require ('../../library/Lms.js');

module.exports = function (registry, log, socket) {

    redis = registry.get('redis');

    return async function (params, cb) {

        let sp = new Screenplay(registry);
        sp.setCode(params.script);
        let room = await Lms(params.room);
        sp.setRoom(room);
        cb({success: true, account: "yup"});
        sp.run(0,0);


        return;

    }
}