$.define("server","flow,  helper, status, deploy, http, more/tidy_html, ejs, hfs, ../app/configs",
    function(Flow, Helper, status, deploy, http, tidy){
        $.mix({
            pagesCache: {}, //用于保存静态页面,可能是临时拼装出来的
            viewsCache: {}, //用于保存模板函数
            staticCache: {} //用于保存静态资源
        })
        //很怀疑是否要动用到mime模块
        var mimes = {
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
        /**一个请求过来，取其pathname，先进入缓存系统取页面，
       没有进入pages目录找，再没有到views目录找模板页面，通过ejs系统拼好返回，
       并放进缓存与pages中，如果views目录没有对应模板，说明是高度动态的页面，
       进入MVC系统，找到对应controller的action来生成页面，如果没有则返回各种错误页面
       deploy,http,app/modules/flow,app/modules/ejs,settings
     */
        //  $.define("router", function(){

        //将路由规则把"/"切割成字符串数组
        function _tokenize (pathStr) {
            var stack = [''];
            for (var i = 0; i < pathStr.length; i ++) {
                var chr = pathStr[i];
                if (chr === '/') {//用于让后面的字符串相加
                    stack.push('');
                    continue;
                } else if (chr === '(') {
                    stack.push('(');
                    stack.push('');
                } else if (chr === ')') {
                    stack.push(')');
                    stack.push('');
                } else {
                    stack[stack.length - 1] += chr;
                }
            }
            return stack.filter(function (str) {
                return str.length !== 0;
            });
        };
        //将(  ) 转换为数组的两端,最后构成一个多维数组返回
        function _parse(tokens) {
            var smallAst = [];
            var token;
            while ((token = tokens.shift()) !== undefined) {
                if (token.length <= 0) {
                    continue;
                }
                switch (token) {
                    case '(':
                        smallAst.push( _parse(tokens));
                        break;
                    case ')':
                        return smallAst;
                    default:
                        smallAst.push(token);
                }
            }
            return smallAst;
        };
        var combine = function (list, func) {
            var first = list.shift();
            var second = list.shift();
            if (second === undefined) {
                return first;
            }
            var combination = first.map(function (val1) {
                return second.map(function (val2) {
                    return func(val1, val2);
                });
            }).reduce(function (val1, val2) {
                return val1.concat(val2);
            });
            if (list.length === 0) {
                return combination;
            } else {
                return combine([combination].concat(list), func);
            }
        };
        function parse(rule) {
            var tokens = _tokenize(rule);
            var ast = _parse(tokens);
            return ast;
        };
        function Router () {
            this.routingTable = {};

        }
        Router.createRouter = function () {
            return new Router;
        };

        Router.prototype._set = function (table, query, value) {
            var nextKey = query.shift();
         
            if (nextKey.length <= 0) {
                throw new Error('Invalid query.');
            }

            if (nextKey[0] === ':') {
                var n = nextKey.substring(1);
                if (table.hasOwnProperty('^n') && table['^n'] !== n) {
                    return false;
                }
                table['^n'] = n;
                nextKey = '^v';
            }
            if (query.length === 0) {
                table[nextKey] = value;
                return true;
            } else {
                var nextTable = table.hasOwnProperty(nextKey) ?
                table[nextKey] : table[nextKey] = {};
                return this._set(nextTable, query, value);
            }
        };

        Router.prototype.add = function (method, path, value) {
            var ast = parse(path),
            patterns = this._expandRules(ast);
      
            if (patterns.length === 0) {
                var query = [method, 0];
                return this._set(this.routingTable, query, value);
            }

            return patterns.every(function (pattern) {
                var length = pattern.length,
                query = [method, length].concat(pattern);
                return this._set(this.routingTable, query, value);
            }.bind(this));
        };

        var methods = [
        'GET',
        'POST',
        'PUT',
        'DELETE'
        ];

        methods.forEach(function (method) {
            (function (method) {
                Router.prototype[method] = function (path, value) {
                    return this.add(method, path, value);
                };
            })(method);
        });

        Router.prototype.ANY = function (path, value) {
            return methods.every(function (method) {
                return this.add(method, path, value);
            });
        };

        Router.prototype.routeWithQuery = function (method, path) {
            var parsedUrl = $.path.parse(path, true),
            dest = this.route(method, parsedUrl.pathname);
            if (dest === undefined) {
                return undefined;
            } else {
                for (var key in parsedUrl.query) {
                    dest.params[key] = parsedUrl.query[key];
                }
                return dest;
            }
        };

        Router.prototype.route = function (method, path) {
            path = path.trim();
            var splitted = path.split('/'),
            query = Array(splitted.length),
            index = 0,
            params = {},
            table = [],
            val, key, j;
            for (var i = 0; i < splitted.length; ++ i) {
                val = splitted[i];
                if (val.length !== 0) {
                    query[index] = val;
                    index ++;
                }
            }
            query.length = index;
            table = this.routingTable[method];
            if (table === undefined) return undefined;
            table = table[query.length];
            if (table === undefined) return undefined;
            for (j = 0; j < query.length; ++ j) {
                key = query[j];
                if (table.hasOwnProperty(key)) {
                    table = table[key];
                } else if (table.hasOwnProperty('^v')) {
                    params[table['^n']] = key;
                    table = table['^v'];
                } else {
                    return undefined;
                }
            }
            return {
                params: params,
                value: table
            };
        };

        Router.prototype._expandRules = function (ast) {
            if (Array.isArray(ast) && ast.length === 0) {
                return [];
            }
            var result = combine(ast.map(function (val) {
                if (typeof val === 'string') {
                    return [[val]];
                } else if (Array.isArray(val)) {
                    return this._expandRules(val).concat([[]]);
                } else {
                    throw new Error('Invalid AST. Unexpected neither a string nor an array.');
                }
            }), function (a, b) {
                return a.concat(b);
            });
            return result;
        };
        var router = new Router
        router.add('GET', '/', function (req, res) {
            console.log("=================")
        });
        router.add('POST', '/users/:user/apps/:app/:id',function(){
             console.log("arguments")
            console.log(arguments)
        });
        //表的结构：method+segments.length 普通字段
        console.log("---------------------")
       console.log( router.routingTable)
         console.log("---------------------")
       console.log( router.routingTable["POST"]["5"]["users"]["^v"] )
        //http://d.hatena.ne.jp/scalar/20120508/1336488868
        //   });


        deploy(  process.cwd() );//监听app目录下文件的变化,实现热启动
        function router2(flow , url){
            switch(url){
                case "/doc" :
                    $.walk( "app/views/doc", function(files, dirs){
                        var pages = files.filter(function(file){
                            return /\.html$/.test(file)
                        });
                        for(var i = 0; i < pages.length; i++){
                            $.log(pages[i])
                        }
                    })
                    flow.fire("static","/");
                    break;
                default:
                    return true
            }
        }

        http.createServer(function(req, res) {
            var flow = Flow()
            flow.res =  res;
            flow.req =  req;
            flow.timeoutID = setTimeout(function(){
                console.log("=============="+flow.req.url)
                flow.fire(404)
            },2500);

            var eee = $.path.parse(req.url, true);
            console.log(eee.pathname+"!!!!!!!!")
            router.route(req.method, eee.pathname);
            flow.helper = Helper()
            //把所有操作都绑定流程对象上
            flow
            .bind("send_file", function( page ){
                //    $.log("进入send_file回调")
                clearTimeout(this.timeoutID)
                var headers =  page.headers || {}
                $.mix(headers, {
                    "Content-Type": page.mine,
                    "mass-mime" :"page.mine"
                });
                
                this.res.writeHead(page.code, headers);
                this.res.write(page.data);
                this.res.end();
            })
            .bind("static", function( url ){
                //  $.log("进入static回调");
                //去掉#？等杂质，如果是符合如下后缀后，则进行静态资源缓存
                if( /\.(css|js|png|jpg|gif|ico)$/.test( url.replace(/[?#].*/, '') ) ){
                    var mine = RegExp.$1
                    url = url.replace(/[?#].*/, '');
                    var cache = $.staticCache[ url ];
                    if( cache ){
                        var lm
                        if(( lm = cache.headers && cache.headers["Last-Modified"] )){
                            if(lm === this.req.headers["if-modified-since"]){
                                res.writeHead(304, "Not Modified");
                                res.end();
                                return;
                            }
                        }
                        this.fire("send_file", cache);
                    }else{
                        //从硬盘中读取数据
                        var statics =  $.path.join("app/public/",url);
                        $.readFile(statics, function(err, data){
                            if(err){
                                this.fire(404)
                            }else{
                                //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，而要用new Date().toGMTString()，因为前者可能出现中文乱码
                                cache = {
                                    code: 200,
                                    data: data,
                                    mine: mimes[ mine ],
                                    headers: {
                                        "Last-Modified":new Date().toGMTString()
                                    }
                                }
                                $.staticCache[ url ] = cache;
                                this.fire("send_file", cache)
                            }
                        }.bind(this));
                    }
                }else{
                    this.fire("get_page", url);
                }
            })
            .bind(404, function( ){
                var text = $.readFileSync( "app/views/error.html", 'utf-8')//读取内容
                var fn = $.ejs(text);
                var data = $.mix(
                    this.helper[0],
                    status["404"], {
                        code: 404
                    });
                var html = fn( data, this.helper[1]);
                data.partial = html;
                var layout_url = $.path.join("app","views/layout", data.layout );
                this.fire("get_layout", layout_url, 404 );
            })
            .bind("get_page", function( url ){
                // $.log("进入get_page回调")
                var last_char = url[ url.length - 1 ]
                //如果是一个目录则默认加上index.html
                if(last_char === "\\" || last_char == "/" ){
                    url += "index.html"
                    url = $.path.normalize(url)
                }
                var cache = $.pagesCache[ url ];
                
                if( cache ){
                    this.fire("send_file", cache);
                }else{
                    var pages_url = $.path.join("app","pages", url );
                    $.readFile( pages_url, 'utf-8', function (err, html) {//读取内容
                        if (err){
                            //如果不存在就从view目录中寻找相应模板来拼装
                            var view_url = $.path.join("app","views", url );
                            this.fire("get_tmpl", view_url, url )
                        }else{
                            var cache = {
                                code: 200,
                                data: html,
                                mine: mimes[ "html" ]
                            }
                            $.pagesCache[ url ] = cache;
                            this.fire("send_file", cache)
                        }
                    }.bind(this));
                }
            })
            .bind("get_tmpl", function( view_url, url ){
                // $.log("进入get_tmpl回调")
                var fn = $.viewsCache[ view_url ]
                if( fn ){
                    var data = this.helper[0];
                    var html = fn( data, this.helper[1]);
                    if(typeof data.layout == "string"){
                        data.partial = html;
                        var layout_url = $.path.join("app","views/layout", data.layout );
                        this.fire("get_layout", layout_url, url );
                    }else{
                        this.fire('cache_page', html, url)
                    }
                }else{
                    $.readFile( view_url,  'utf-8', function(err, text){
                        if(err){
                            this.fire( 404 )
                        }else{
                            $.viewsCache[ view_url ] = $.ejs( text );
                            this.fire( "get_tmpl", view_url, url );
                        }
                    }.bind(this) );
                }

            })
            .bind('cache_page', function( html, url ){
                //  $.log("进入cache_page回调")
                html = tidy(html);
                var cache = {
                    code: 200,
                    data: html,
                    mine: mimes[ "html" ]
                }
                var pages_url = $.path.join("app","pages", url );
                // $.writeFile(pages_url, html )
                // $.pagesCache[ url ] = cache;
                this.fire("send_file", cache)
            })
            .bind("get_layout", function( layout_url, url ){
                //  $.log("进入get_layout回调")
                var fn = $.viewsCache[ layout_url ]
                if( fn ){
                    var html = fn( this.helper[0], this.helper[1] );
                    this.fire('cache_page', html, url);
                }else{
                    $.readFile( layout_url,  'utf-8', function(err, text){
                        if(err){
                            this.fire( 404 )
                        }else{
                            var fn = $.ejs( text );
                            if(url){//如果指定了第二个参数才存入缓存系统
                                $.viewsCache[ layout_url ] = fn
                                this.fire("get_layout", layout_url, url)
                            }else{
                                var html = fn( this.helper[0] );
                                this.fire('cache_page', html, url)
                            }
                           
                        }
                    }.bind(this))
                }
            });
            if(router2(flow, req.url)){
                flow.fire("static", req.url)
            }

           
       

        }).listen( $.configs.port );
    //今天的任务支持CSS JS 图片
    });

//http://www.w3.org/html/ig/zh/wiki/Contributions#bugs
//http://yiminghe.iteye.com/blog/618432

//doTaskList = function(dataList, doAsync, callback){
//    dataList = dataList.slice();
//    var ret = [];
//    var next = function(){
//        if(dataList.length < 1)
//            return callback(null, ret)
//        var d = dataList.shift();
//        try{
//            doAsync(d, function(err,data){
//                if(err)
//                    return callback(err);
//                ret.push(data);
//                next();
//            })
//        }catch(err){
//            return callback(err)
//        }
//    }
//    next();
//}

