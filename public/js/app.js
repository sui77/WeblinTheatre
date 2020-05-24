class Site {

    id = null;

    constructor() {
        const urlParams = new URLSearchParams(self.location.search);
        this.room = urlParams.get('room');
        if (this.room == null) {
            $('body').append($('<div style="background-color:#f00;width:100%;height:20px;position:fixed;top:0;left:0;color:white;text-align:center;font-family:sans-serif;z-index:9999">room is not defined</div>'));
        }
        $.get('examples/revolution.txt', (data) => {
            $('#code').html(data);
            this._initCodeMirror();
        });
        this.run();
    }

    run() {
        let self = this;
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
