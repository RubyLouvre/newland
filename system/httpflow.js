$.define(  ["./helper", "$cookie", "$flow" ], function( helper,cookie ){
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

    var Store = function(flow){
        this.mtime = Date.now()
        this.flow = flow;
    }
    Store.prototype = {
        open: function(life, data){
            this.data = this.flow.session  = data;
            this.mtime = Date.now() + life;
            $.log('fire open_session', "green", 6);
            this.flow.fire("open_session");
        }
    }
    var formats = {
        txt:  [ 'text/plain'],
        html: ['text/html'],
        json: ['application/json', 'text/json'],
        xml:  ['application/xml', 'text/xml'],
        js:   ['application/javascript', 'text/javascript']
    }
    for(var key in formats){
        var arr = formats[key];
        formats[key] = new RegExp(  arr.join('|').replace(/(\/)/g, "\\$1"))
    }
    HttpFlow = $.factory({
        init: function(){
            this.helper = helper()
        },
        inherit: $.Flow,
        render: function(){
            if(!this.rendered){
                var accept = this.req.headers.accept || 'text/plain';
                for (var key in formats) {
                    if (  formats[key].test(accept) ) {
                        this.fire("respond_to", key)
                        return;
                    }
                }
            //这里会提示错误
            }

        },
        //为flow添加一系列属性,并劫持res.writeHead,res.setHeader
        patch: function(req, res){
            this.res =  res;
            this.req =  req;
            this.url = req.url;
            this.pathname = req.url.replace(/[?#].*/, '')
            this.params = {};
            this.store = new Store(this)
          
            var flow = this;
            var writeHead = res.writeHead;
            var setHeader = res.setHeader;
            flow._setHeader = setHeader;
            res.writeHead = function(){
                flow.fire('before_header');
                flow.fire('header');
                writeHead.apply(this, arguments);
                this.writeHead = writeHead;//还原
            }
            res.setHeader = function(field, val){
                var key = field.toLowerCase()
                if ( 'set-cookie' == key ) {
                    var array = typeof val == "string" ? [val] : val;
                    array.forEach(function(str){
                        var arr =  str.split("=");
                        flow.addCookie(arr[0], arr[1])
                    })
                } else{
                    if ('content-type' == key ) {
                        val += '; charset=' + $.core.charset
                    }
                    setHeader.call(this, field, val);
                }
            }
        },
        contentType: function( name ){
            return type_mine[ name ]
        },
        addCookie: function(name, val, opt){
            if(!this.resCookies){
                this.resCookies = {};
                this.resCookies[name] = [val, opt]
                this.bind("header", function(){
                    var array = []
                    for(var i in this.resCookies){
                        var arr = this.resCookies[i];
                        array.push( cookie.stringify(i, arr[0], arr[1] ) )
                    }
                    this._setHeader.call(this.res, "Set-Cookie",array)
                })
            }else{
                this.resCookies[name] = [val, opt]
            }
            return this;
        },
        removeCookie: function(name){
            var cookies = Array.isArray(name) ? name : [ name ];
            cookies.forEach(function(cookie){
                this.addCookie(cookie,"", 0)
            },this);
            return this;
        },
        //Content-Type 相当于content-type
        getHeader: function(name){
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

        setHeader: function(field, val){
            var req = this.req
            if (2 == arguments.length) {
                req.setHeader(field, '' + val);
            } else {
                for (var key in field) {
                    req.setHeader(key, '' + field[key]);
                }
            }
            return this;
        }
    });
    HttpFlow.prototype.__defineGetter__("mime", function(){
        if(this._mime){
            return this._mime;
        }
        return  this._mime = /\.(\w+)$/.test( this.pathname ) ?
        RegExp.$1 : "*"
    })
    HttpFlow.prototype.__defineGetter__("xhr", function(){
        if(!this.req)
            return false;
        var val = this.req.getHeader('X-Requested-With') || '';
        return 'xmlhttprequest' == val.toLowerCase();
    });   
    return HttpFlow

});
    //2012.8.18 httpflow添加一个patch的打补丁方法，用于添加一系列属性与重写res.whiteHeader方法，添加一强大的储存对象
    //2012.8.19 重构addCookie,removeCookie,并劫持res.setHeader方法
    //2012.8.20 httpflow.patch 重构writeHead，添加多一个钩子before_cookie,并劫持res.end方法