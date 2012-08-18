$.define("httpflow","helper,cookie,mass/flow,mass/more/ejs", function( make_helper,cookie ){
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
        this.flow = flow;
        var session = this;
        //如果没有打开open操作,此四方法只是用于保存参数
        String("set,get,remove,close").replace($.rword, function(name){
            session[ "_" + name ] = [];
            session[ name ] = function(){
                session[ "_" + name ].push(  arguments );
            }
        });
        //set,get,remove,clear等事件必须在open操作之后才能执行!
        flow.bind("open_session_"+flow.id, function( ){
            String("set,get,remove,close").replace($.rword, function(name){
                delete session[ name ];//露出原始的原型方法
                var array = session[ "_" + name ];
                for(var args; args = array.shift();){
                    session[ name ].apply( session, args )
                }
            });
        });
    }
    Store.prototype = {
        //每次操作都延长一段时间
        get: function (key){
            this.timestamp = Date.now() + this.life;
            return this.data[ key ];
        },
        set: function (key, val){
            this.timestamp = Date.now() + this.life;
            this.data[key] = val;
        },
        remove: function (key){
            this.timestamp = Date.now() + this.life;
            delete this.data[key];
        },
        close: function (){
            this.data = {};
        },
        open: function( data, life ){
            this.data = data;
            this.life = life;
            this.flow.fire("open_session_"+ this.flow.id)
        }
    }
    
    HttpFlow = $.factory({
        init: function(){
            this.helper = make_helper()
        },
        inherit: $.Flow,
        //为flow添加一系列属性,并重写res.writeHead
        patch: function(req, res){
            this.res =  res;
            this.req =  req;
            this.originalUrl = req.url;
            this.params = {};
            this.session = new Store(flow)
            var flow = this;
            var writeHead = res.writeHead;
            res.writeHead = function(){
                flow.fire('header');
                writeHead.apply(this, arguments);
                this.writeHead = writeHead;//还原
            }
        },
        content_type: function( name ){
            return type_mine[ name ]
        },
//        addCookie: function(name,val, opt){
//            var res = this.res;
//            var cookie = this.cookie || new cookie(this.req)
//            cookie.set(name, val, opt);
//            res.setHeader("Set-Cookie",cookie._resCookies)
//        },
//        removeCookie: function(name){
//            var res = this.res;
//            var cookie = this.cookie || new cookie(this.req);
//            cookie.remove(name);
//            res.setHeader("Set-Cookie",cookie._resCookies)
//        },
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

});
//2012.8.19 httpflow添加一个patch的打补丁方法，用于添加一系列属性与重写res.whiteHeader方法，添加一强大的储存对象