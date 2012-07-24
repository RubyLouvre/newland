$.define("server","flow,  helper, status, deploy, http, more/tidy_html, ejs, hfs, ../app/configs,mvc",
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

