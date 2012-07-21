$.define("server","flow, view, status, deploy, fs, url, querystring, http, path, ../app/configs",
    function(flow, view, status, deploy, fs, url, qs, http, path){
        
        $.mix({
            pagesCache: {},
            viewsCache: {}
        })
        var mimeMap = {
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'xml': 'application/xml',
            'json': 'application/json',
            'js': 'application/javascript',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'png': 'image/png',
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
        var rext = /[^\/]\/.+?\.(\w+)$/
        deploy(  process.cwd() );//监听app目录下文件的变化,实现热启动
        http.createServer(function(req, res) {
            var location =  url.parse( req.url );
            location.query = qs.parse(location.query || "") ;
            location.toString = function(){
                return req.headers.host + req.url;
            }
            var cache_key = location.pathname;
            
            var mime = rext.test( cache_key ) && RegExp.$1 || "text"
            var contentType = req.headers['content-type'] ||  mimeMap[ mime ];

            var event = flow(), page = $.pagesCache[ cache_key ]

            function sendFile(res, page){
                res.writeHead(page.code, {
                    "Content-Type": page.mine
                });
                res.write(page.data);
                res.end();
            }
            //如果是静态资态
            if(/\.(css|js|png|jpg|gif)$/.test( cache_key )){
                if(page){
                    console.log("直接从内存里面读取,不进行IO操作")
                    sendFile(res, page);
                }else{
                    var statics =  path.join("app/public/",cache_key);
                    fs.readFile(statics, function(e, data){
                        if(e){
                            return page.fire(404)
                        }
                        page = {
                            code: 200,
                            data: data,
                            mine: mimeMap[RegExp.$1]
                        }
                        sendFile(res, page);
                        $.pagesCache[ cache_key ] = page;
                    })
                }
                return
            }
            var pages_key = $.path("app","pages", cache_key )
            var views_key = pages_key.replace("app\\pages", "app\\views");
            fs.readFile( pages_key, 'utf-8', function (err, data) {//读取内容
                if (err){
                    event.fire(views_key)
                }else{
                    event.fire(pages_key, data)
                }
            });

            var data = {
                scripts : [],
                title: function( t ){
                    data.title = t
                },
                layout: function( t ){
                    data.layout = t
                },
                script: function(url, nocache){
                    if(nocache){
                        url += (/\?/.test( url) ? "&" : "?" ) + "_time=" + Date.now();
                    }
                    data.scripts.push( '<script src="' +url +'" type="text/javascript"></scr'+'ipt>')
                }
            };
            //明天再把404抽取出来
            event
            .bind(pages_key,function(data){
                res.writeHead(200, {
                    "Content-Type":  contentType
                });
                res.write(data);
                res.end();
            } )
            .bind(views_key,function(){ //尝试取得
                if(/\\$/.test(views_key)){ //如果是一个目录则默认加上index.html
                    views_key += "index.html"
                }
                fs.readFile( views_key, 'utf-8', function (err ) {//读取内容
                    if (err){
                        event.fire("404")
                    }else{
                        view(res, data, event, {
                            url: views_key,
                            pagesKey:pages_key,
                            status: 200,
                            data: data,
                            cacheKey: cache_key,
                            cachePage: true,
                            contentType:contentType
                        });
                    }
                })
            })
            .bind(404, function(){
                var object = status[404];
                object.code = 404;
                view(res, data, event, {
                    url: $.path("app","views", "error.html" ),
                    status: 404,
                    data: object,
                    contentType:contentType
                });
            })

        }).listen($.configs.port);
    //今天的任务支持CSS JS 图片
    })