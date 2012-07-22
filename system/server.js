$.define("server","flow,  helper, status, deploy, fs, http, ejs, ../app/configs",
    function(Flow, Helper, status, deploy, fs, http, ejs){
        
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
        //   var url = "/special/show_6582212/wbUD55K148PI7ryhIVCuhg...html"
        //   var a = /(?:\.)(\w*)(?=$|\?|#|\:)/.test(url) && RegExp.$1 || "text";
        //   console.log(a)
        deploy(  process.cwd() );//监听app目录下文件的变化,实现热启动


        http.createServer(function(req, res) {
            var flow = Flow()
            flow.res =  res;
            flow.req =  req;
            
            flow.helper = Helper()
            //把所有操作都绑定流程对象上
            flow
            .bind("send_file", function( page ){
                 $.log("进入send_file回调")
                this.res.writeHead(page.code, {
                    "Content-Type": page.mine
                });
                this.res.write(page.data);
                this.res.end();
            })
            .bind("static", function( url ){
                $.log("进入static回调")
                var cache = $.staticCache[ url ];
                if( cache ){
                    this.fire("send_file", cache);
                }else if( /\.(css|js|png|jpg|gif)$/.test( url ) ){
                    var statics =  $.path.join("app/public/",url);
                    fs.readFile(statics, function(err, data){
                        if(err){
                            this.fire(404)
                        }else{
                            var cache = {
                                code: 200,
                                data: data,
                                mine: mimes[ RegExp.$1 ]
                            }
                            send_file(res, cache);
                        }
                        cache = {
                            code: 200,
                            data: data,
                            mine: mimes[ RegExp.$1 ]
                        }
                        $.staticCache[ url ] = cache;
                        this.fire("send_file", cache)
                    }.bind(this));
                }else{
                    this.fire("get_page", url);
                }
            })
            .bind("get_page", function( url ){
                $.log("进入get_page回调")
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
                    fs.readFile( pages_url, 'utf-8', function (err, text) {//读取内容
                        if (err){
                            //如果不存在就从view目录中寻找相应模板来拼装
                            var view_url = $.path.join("app","views", url );
                            this.fire("get_tmpl", view_url, url )
                        }else{
                            var cache = {
                                code: 200,
                                data: text,
                                mine: mimes[ "html" ]
                            }
                            $.pagesCache[ url ] = cache;
                            this.fire("send_fire", cache)
                        }
                    }.bind(this));
                }
            })
            .bind("get_tmpl", function( view_url, url ){
                $.log("进入get_tmpl回调")
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
                    fs.readFile( view_url,  'utf-8', function(err, text){
                        if(err){
                            this.fire( 404 )
                        }else{
                            $.viewsCache[ view_url ] = $.ejs( text );
                            console.log( $.viewsCache[ view_url ] +"")
                            this.fire( "get_tmpl", view_url, url );
                        }
                    }.bind(this) );
                }

            })
            .bind('cache_page', function( html, url ){
                $.log("进入cache_page回调")
                var cache = {
                    code: 200,
                    data: html,
                    mine: mimes[ "html" ]
                }
                $.pagesCache[ url ] = cache;
                console.log(cache)
                this.fire("send_file", cache)
            })
            .bind("get_layout", function( layout_url, url ){
                $.log("进入get_layout回调")
                var fn = $.viewsCache[ layout_url ]
                if( fn ){
                    var html = fn( this.helper[0] );
                    this.fire('cache_page', html, url)
                }else{
                    fs.readFile( layout_url,  'utf-8', function(err, text){
                        if(err){
                            this.fire( 404 )
                        }else{
                            $.viewsCache[ layout_url ] = $.ejs( text );
                            this.fire("get_layout", layout_url, url)
                        }
                    }.bind(this))
                }
            })
            .fire("static", req.url)
       

        }).listen( $.configs.port );
    //今天的任务支持CSS JS 图片
    })