class Site {

    id = null;
    token = null;
    context = null;

    constructor() {

        try {
            const urlParams = new URLSearchParams(self.location.search);

            let token64 = urlParams.get('context');
            this.context = token64;
            if (token64 == null) {
                throw Error('missing context');
            }
            let tokenJ = atob(token64);
            console.log(token64, tokenJ);
            if (tokenJ == '') {
                throw Error('could not decode token');
            }
            let token = JSON.parse(tokenJ);
            if (typeof token.payload == 'undefined' || typeof token.payload.room == 'undefined') {
                throw Error('room not defined');
            }
            this.room = token.payload.room;
            this.run();
        } catch (e) {
                $('body').append($('<div style="background-color:#f00;width:100%;height:20px;position:fixed;top:0;left:0;color:white;text-align:center;font-family:sans-serif;z-index:9999">' + e.message + '</div>'));
        }
    }

    async run() {
        let self = this;

        let r = await self._rpcCall('load', {context: self.context} );
        $('#code').html( r.code );
        this._initCodeMirror();

        $('.js-play').click(async function (e) {
            if (self.id == null) {
                $(this).removeClass('btn-play').addClass('btn-stop');
                e.preventDefault();
                let params = {
                    room: self.room,
                    script: self.myCodeMirror.getValue(),
                }
                let r = await self._rpcCall('play', params)
                self.id = r.spId;
            } else {
                let r = await self._rpcCall('stop', {spId: self.id } );
            }
        });

        $('.js-save').click(async function (e) {
            //$(this).removeClass('btn-play').addClass('btn-stop');
            e.preventDefault();
            let params = {
                context: self.context,
                script: self.myCodeMirror.getValue(),
            }
            let r = await self._rpcCall('save', params)
            if (!r.status) {
                alert('failed');
            }
        });

        setInterval( async () => {
            if (self.id != null) {
                let r = await self._rpcCall('status', {spId: self.id} );
                if (r.status == 0) {
                    $('.js-play').removeClass('btn-stop').addClass('btn-play');
                    self.id = null;
                }
                console.log("Status: ", r);
            }
        }, 2000);

    }

    checkRunning() {

    }

    _initCodeMirror() {
        CodeMirror.defineSimpleMode("simplemode", {
            start: [
                {
                    regex: /(.*?)(\.)(avatar|move|say|leave)(\s+)(.*)/,
                    token: ["def", null, "variable-2", null, "variable-3"]
                },
                {
                    regex: /(System\.pause)(\s+)(.*)/,
                    token: ["keyword", null, "variable-3"]
                },

            ],
            comment: [
                {regex: /.*?\XXX*\//, token: "comment", next: "start"},
                {regex: /.*XXX/, token: "comment"}
            ],
            meta: {
                dontIndentStates: ["comment"],
                lineComment: "#"
            }
        });

        this.myCodeMirror = CodeMirror.fromTextArea(
            document.getElementById('code')
            , {
                mode: "simplemode",
                lineNumbers: true,
                styleActiveLine: true,
                gutters: ["wtf"],
            }
        );

    }

    _rpcCall(method, params) {
        return new Promise((resolve, reject) => {
            let data = {
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: 1
            }
            $.ajax({
                type: "POST",
                url: '/api',
                data: JSON.stringify(data),
                contentType: 'application/json',
                processData: false,
                success: (res) => {
                    resolve(res);
                }
            });

        });
    }
}
