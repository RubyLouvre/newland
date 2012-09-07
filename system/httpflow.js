$.define(  [ "$cookie",  "./mime","$flow", ], function( cookie, mime ){
    $.mix($, mime)
    HttpFlow = $.factory({
        inherit: $.Flow,
        render: function(format, obj){// format
            if(!this.rendered){
                this.rendered = true;
                if(typeof format == "string"){
                    return this.fire("respond_to", format, obj)
                }
                if(format && typeof format == "object"){
                    var accept = this.req.headers.accept || 'text/plain';
                    var type = $.accept2ext(accept)
                    return this.fire("respond_to", type, format);
                }
            }
           // this.fire("send_error", 403, "不能重复调用render方法")
        },
        redirect: function(path){//这里的path是路由规则中能找到的
            this.rendered = true;
            var res = this.res;
            res.statusCode = 301;
            res.setHeader('Location', path);
            res.end('Redirecting to ' + path);
        },
        //为flow添加一系列属性,并劫持res.writeHead,res.setHeader
        patch: function(req, res){
            this.res =  res;
            this.req =  req;
            this.url = req.url;
            this.method = req.method;
            this.pathname = req.url.replace(/[?#].*/, '')
            this.params = this.store = {}
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
//                    if ('content-type' == key ) {
//
//                        val += '; charset=' + $.core.charset
//                            console.log(val)
//                    }
                    setHeader.call(this, field, val);
                }
            }
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
                    return headers[ name ] || "";
            }
        },

        setHeader: function(field, val){
            var res = this.res
            if (2 == arguments.length) {
                res.setHeader(field, '' + val);
            } else {
                for (var key in field) {
                    res.setHeader(key, '' + field[key]);
                }
            }
            return this;
        }
    });
    HttpFlow.prototype.__defineGetter__("mime", function(){
        if(this._mime){
            return this._mime;
        }
        var accept = this.req.headers.accept;
        return  this._mime = $.accept2mime( accept ) || $.path2mime( this.pathname, "*")
    })
    HttpFlow.prototype.__defineGetter__("xhr", function(){
        if(!this.req)
            return false;
        var val = this.getHeader("X-Requested-With");
        return 'xmlhttprequest' == val.toLowerCase();
    });   
    return HttpFlow

});
    //2012.8.18 httpflow添加一个patch的打补丁方法，用于添加一系列属性与重写res.whiteHeader方法，添加一强大的储存对象
    //2012.8.19 重构addCookie,removeCookie,并劫持res.setHeader方法
    //2012.8.20 httpflow.patch 重构writeHead，添加多一个钩子before_cookie,并劫持res.end方法