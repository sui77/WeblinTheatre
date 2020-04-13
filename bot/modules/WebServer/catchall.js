const fs = require('fs');
const mimeTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript'
}

module.exports = function (options) {
    let config = options.config;

    function replaceVars(str) {
        return str.replace(/\{\$.*?\}/g, (str) => {
            let key = str.replace(/\{|\}|\$/g, "");
            return config.get('location.' + key );

        })
    }

    return async function (ctx, next) {
        let url;
        if (ctx.response.status != 404) {
            return;
        }
        try {
            url = ctx.request.url
                .replace(/\?.*/, '')
                .replace(/\/$/, '/index.html');

            if (url.match(/\.\./)) {
                throw new ForbiddenError('forbidden');
            }

            ctx.response.body = await fs.readFileSync(config.get('location.htdocs') + '/' + url);
            let extension = url.split('.').pop();

            if (typeof mimeTypes[extension] != 'undefined') {
                ctx.set('Content-type', mimeTypes[extension]);
            }

            if (extension == 'html') {
                ctx.response.body = replaceVars(ctx.response.body.toString());
            }

            ctx.response.status = 200;
        } catch (e) {
            if (e.name == 'ForbiddenError') {
                ctx.response.status = 403;
                ctx.response.body = "403 Forbidden";
            } else if (e.message.match(/^ENOENT/)) {
                ctx.response.status = 404;
                ctx.response.body = "404 Not Found \n " + url;
            } else {
                ctx.response.status = 500;
                ctx.response.body = "500 Internal Server Error (" + e.message + url + ")";

            }
        }
        await next();
    }

};


class NotFoundError extends Error {
    constructor(message) {
        super(message)
        this.name = 'NotFoundError'
        this.message = message
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ForbiddenError'
        this.message = message
    }
}