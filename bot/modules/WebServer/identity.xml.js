module.exports = function (options) {
    config = options.config;

function encodeHtml(s) {
    return s.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
}

    return async function (ctx, next) {
        try {

            console.log("PID", ctx.params.id);
            if (!options.registry.get('botPool').exists(ctx.params.id)) {
                throw new NotFoundError("Not found");
            }

            let bot = options.registry.get('botPool').get(ctx.params.id);
            let nickname = bot.nickname;
            let avatarUrl = encodeHtml(bot.avatarUrl);

            let body = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE identity-xml>
<identity xmlns="http://schema.bluehands.de/digest-container" digest="1">
    <item id="avatar" contenttype="avatar" digest="1" src="http://avatar.zweitgeist.com/gif/004/jacketngloves/turn.gif" order="1"/>
    <item id="avatar2" contenttype="avatar2" digest="1" src="${avatarUrl}" mimetype="avatar/gif" order="1"/>
    <item id="properties" contenttype="properties" digest="1" encoding="plain" mimetype="text/plain" order="1">
        <![CDATA[KickVote=true
Nickname=${nickname}
]]>
    </item>
</identity>`;


            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Content-type', 'text/xml');
            ctx.response.body = body;
            ctx.response.status = 200;

        } catch (e) {
            if (e.name == 'NotFoundError') {
                ctx.response.status = 404;
                ctx.response.body = "404 Not Found";
            } else {
                ctx.response.status = 500;
                ctx.response.body = "500 Internal Server Error (" + e.message + ")";

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