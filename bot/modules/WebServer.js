const Router = require('koa-router');
const Koa = require('koa');
const koaBody = require('koa-body');

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'WebServer'});

class WebServer {
    constructor(registry) {
        this.registry = registry;
        this.config = registry.get('config');
    }

    start() {
        log.info('Starting WebServer server on port ' + this.config.get('webserverPort'));

        const router = new Router();

        router.get( '/identity/:id.xml', require('./WebServer/identity.xml.js')({registry: this.registry, config: this.config}));
        router.post('/api', require('./WebServer/api.js')({registry: this.registry, config: this.config}));

        const app = new Koa();
        app
            .use(koaBody())
            .use(router.routes())
            .use(router.allowedMethods())
            .use( require('./WebServer/catchall.js')({registry: this.registry, config: this.config}) )
            .use( async(ctx, next) => {
                let ip = typeof ctx.request.headers['x-forwarded-for'] == 'undefined' ? ctx.ip : ctx.request.headers['x-forwarded-for'];
                log.info(ip + ' ' + ctx.response.status + ' ' + ctx.request.method + ' ' + ctx.request.url);
                await next();
            })
            .listen(this.config.get('webserverPort'))
            .setTimeout(15000);

    }
}

module.exports = WebServer;