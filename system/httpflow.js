$.define("httpflow","helper,Cookie,mass/flow,mass/more/ejs", function( make_helper,Cookie ){
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
    //为flow添加一个session成员,它拥有set, get, remove, close
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
            if(typeof key == "function"){
                return key.call(this.data)
            }
            return this.data[ key ];
        },
        set: function (key, val){
            this.timestamp = Date.now() + this.life;
            if(typeof key == "function"){
                return key.call(this.data)
            }else{
                this.data[key] = val;
            }
        },
        remove: function (key){
            this.timestamp = Date.now() + this.life;
            if(typeof key == "function"){
                return key.call(this.data)
            }else{
                delete this.data[key];
            }
           
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
        //为flow添加一系列属性,并劫持res.writeHead,res.setHeader
        patch: function(req, res){
            this.res =  res;
            this.req =  req;
            this.originalUrl = req.url;
            this.params = {};
            this.session = new Store(this)
            this.flash =  function(type, msg){
                switch(arguments.length){
                    case 2:
                        this.fire("set_session_"+this.id, function(){
                            var data = this;
                            var flash = data.flash ||  (data.flash  || {});
                            if( flash[ type ] ){
                                flash[ type ].push( msg )
                            }else{
                                flash[ type ] = [msg]
                            }
                        });
                        break;
                    case 1:
                        this.fire("get_session_"+this.id, function(){
                            var data = this;
                            var flash = data.flash ||  (data.flash  || {});
                            return  flash[ type ] || []
                        });
                        break;
                    case 0:
                        this.fire("remove_session_"+this.id, function(){
                            var data = this;
                            delete data.flash;
                        });
                        break;
                }
            }
            var flow = this;
            var writeHead = res.writeHead;
            var setHeader = res.setHeader;
            flow._setHeader = setHeader;
            res.writeHead = function(){
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
                    if ('content-type' == key && this.charset) {
                        val += '; charset=' + this.charset;
                    }
                    setHeader.call(this, field, val);
                }
            }
        },
        content_type: function( name ){
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
                        array.push( Cookie.stringify(i, arr[0], arr[1] ) )
                    }
                    this._setHeader.call(this.res, "Set-Cookie",array)
                })
            }else{
                this.resCookies[name] = [val, opt]
            }
            return this;
        },
        removeCookie: function(name){
            if(Array.isArray(name)){
                name.forEach(function(cookie){
                    this.addCookie(cookie,"", 0)
                },this);
                return this;
            }
            return this.addCookie(name,"", 0)
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

});
//2012.8.18 httpflow添加一个patch的打补丁方法，用于添加一系列属性与重写res.whiteHeader方法，添加一强大的储存对象
//2012.8.19 重构addCookie,removeCookie,并劫持res.setHeader方法