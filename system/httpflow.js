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
    return $.factory({
        init: function(){
            this.helper = make_helper()
        },
        inherit: $.Flow,
        //Content-Type 相当于content-type
        header : function(name){
            var headers = this.req.headers
            switch (name = name.toLowerCase()) {
                case 'referer':
                case 'referrer':
                    return headers.referrer
                    || headers.referer;
                default:
                    return headers[ name ];
            }
        },
        mime : function() {
            var str = this.header( 'content-type' ) || '';
            return str.split(';')[0];
        },
        content_type: function( type ){
            type = $.type(type, "String") && ( type.length > 0 ) ? type : this.mime();
            return type_mine[ type] || "";
        }
    })
})