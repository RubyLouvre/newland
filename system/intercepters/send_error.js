$.define("send_error","http", function( http ){

    return function( flow ){
        flow.bind("send_error", function( code ){
            var text = $.readFileSync( "app/views/error.html", 'utf-8')//读取内容
            var fn = $.ejs( text );
            var data = $.mix(
                this.helper[0], {
                    code: code,
                    status: http.STATUS_CODES[code]
                });
            var html = fn( data, this.helper[1]);
            data.partial = html;
            var layout_url = $.path.join("app","views/layout", data.layout );
            this.fire("get_layout", layout_url, code );

        });
    }
})


