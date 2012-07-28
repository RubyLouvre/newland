$.define("httpflow","helper,flow, ejs", function( make_helper ){
    var type_mine = {
        "css": "text/css",
        "gif": "image/gif",
        "html": "text/html",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml",
        'manifest': 'text/cache-manifest'
    };
    HttpFlow = $.factory({
        init: function(){
            this.helper = make_helper()
        },
        inherit: $.Flow,
        content_type: function( name ){
            return type_mine[ name ]
        },
        //Content-Type 相当于content-type
        get: function(name){
            var headers = this.req.headers || {}
            switch (name = name.toLowerCase()) {
                case 'referer':
                case 'referrer':
                    return headers.referrer
                    || headers.referer;
                default:
                    return headers[ name ];
            }
        },

        set: function(field, val){
            var req = this.req
            if (2 == arguments.length) {
                req.setHeader(field, '' + val);
            } else {
                for (var key in field) {
                    req.setHeader(key, '' + field[key]);
                }
            }
            return this;
        },
        mime : function() {
            var str = this.get( 'content-type' ) || '';
            return str.split(';')[0];
        }
    });
    HttpFlow.prototype.__defineGetter__("xhr", function(){
        if(!this.req)
            return false;
        var val = this.get('X-Requested-With') || '';
        return 'xmlhttprequest' == val.toLowerCase();
    })
    return HttpFlow

})