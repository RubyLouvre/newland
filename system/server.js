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

        function send_file(res, page){
            res.writeHead(page.code, {
                "Content-Type": page.mine
            });
            res.write(page.data);
            res.end();
        }

        function make_view( fn,  helper ){

        }
        function make_layout( fn,  helper ){

        }
        function make_page( view_url, page_url, helper, res ){
            var flow = this;
            var fn = $.viewsCache[ view_url ]
            if( fn ){
                text = fn.call(helper, {});
                if(typeof helper.layout == "string"){
                    helper.partial = text;
                    var layout_url = $.path.join("app","views/layout", helper.layout );
                    fn = $.viewsCache[ layout_url ] ;
                }
            }else{
                //读取对应的局部模块,并将它转换成函数,存入缓存系统,如果存在layout,进一步读取layout
               
                fs.readFile( view_url,  'utf-8', function(err, text){
                    if(err){
                        flow.fire( 404 )
                    }else{
                        fn = $.viewsCache[ view_url ] = $.ejs( text );
                    }
                    console.log(fn+"")
                    text = fn.call({},{
                        helper: helper
                    });
                    console.log(text)
                    if(typeof helper.layout == "string"){
                        helper.partial = text;
                        var layout_url = $.path.join("app","views/layout", helper.layout )
                        fs.readFile( view_url,  'utf-8', function(err, text){
                            if(err){
                                flow.fire( 404 )
                            }else{
                                fn = $.viewsCache[ layout_url ] = $.ejs( text );
                                var cache = {
                                    code: 200,
                                    data: fn(helper),
                                    mine: mimes[ "html" ]
                                }
                                send_file(res, cache);
                                $.staticCache[ page_url ] = cache;
                            }
                        })
                    }
                });
            }
        }

        http.createServer(function(req, res) {
            var location =  $.path.parse( req.url, true );
            location.toString = function(){
                return req.headers.host + req.url;
            }
            var url = location.pathname;
            var flow = Flow()
            .bind("page",make_page)
            .bind("view",make_view)


            var cache = $.staticCache[ url ];

            if( cache ){
                return send_file(res, cache);
            }else if( /\.(css|js|png|jpg|gif)$/.test( url ) ){
                var statics =  $.path.join("app/public/",url);
                fs.readFile(statics, function(err, data){
                    if(err){
                        return flow.fire(404)
                    }
                    cache = {
                        code: 200,
                        data: data,
                        mine: mimes[ RegExp.$1 ]
                    }
                    send_file(res, cache);
                    $.staticCache[ url ] = cache;
                });
                return
            }

            //开始处理页面
            var last_char = url[ url.length - 1 ]
            if(last_char === "\\" || last_char == "/" ){ //如果是一个目录则默认加上index.html
                url += "index.html"
                url = $.path.normalize(url)
            }

            cache = $.pagesCache[ url ];
            if( cache ){
                return  send_file(res, cache);
            }else{
                var pages_url = $.path.join("app","pages", url );
                fs.readFile( pages_url, 'utf-8', function (err, data) {//读取内容
                    if (err){
                        var a =  new Helper;
                        console.log(a.set_title)
                        flow.fire("page", pages_url.replace("app\\pages", "app\\views"), pages_url, new Helper, res )
                    }else{
                        cache = {
                            code: 200,
                            data: data,
                            mine: mimes[ "html" ]
                        }
                        $.pagesCache[ url ] = cache;
                        send_file(res, cache);
                    }
                });
            }

        }).listen( $.configs.port );
    //今天的任务支持CSS JS 图片
    })