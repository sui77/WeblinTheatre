const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'LMS'});

module.exports = async function(url) {
    return new Promise(function (resolve, reject) {
        var request = require('request');
        request.post({
            url: 'http://lms.virtual-presence.org/api/',
            form: {Method: "VPI.Map", sDocumentURL: url, sLang: ''},
        }, function (error, response, body) {

            if (error || response.statusCode !== 200) {
                throw new Error('LMS failed')
            }
            else {
                let tmp = body.split("\n")[1].split("=xmpp:").pop();
                resolve(tmp);
            }
        });
    });
};