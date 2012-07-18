$.define("server","./flow,./view,./status,fs,url, querystring, http, app/configs", function(flow, view, status, fs, url, qs, http){
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
    //   var url = "/special/show_6582212/wbUD55K148PI7ryhIVCuhg...html"
    //   var a = /(?:\.)(\w*)(?=$|\?|#|\:)/.test(url) && RegExp.$1 || "text";
    //   console.log(a)
    var rext = /[^\/]\/.+?\.(\w+)$/
    // var rext = /(?:\.)(\w*)(?=$|\?|#|\:)/
    http.createServer(function(req, res) {
        var location =  url.parse( req.url );
        location.query = qs.parse(location.query || "") ;
        location.toString = function(){
            return req.headers.host + req.url;
        }
        // console.log(location)
        var cache_key = location.pathname;
        var mime = rext.test( cache_key ) && RegExp.$1 || "text"
        var contentType = req.headers['content-type'] ||  mimeMap[ mime ]

        if( $.pagesCache[ cache_key ]){
            console.log("先从缓存系统中寻找")
        }else{
            var event = flow();
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
                title: function( t ){
                    data.title = t
                },
                layout: function( t ){
                    data.layout = t
                }
            };
            //明天再把404抽取出来
            event
            .bind(pages_key,function(data){
                //这里也应该用views生成
                res.writeHead(200, {
                    "Content-Type":  contentType
                });//注意这里
                res.write(data);
                res.end();
            } )
            .bind(views_key,function(){ //尝试取得
                fs.readFile( views_key, 'utf-8', function (err ) {//读取内容
                    if (err){
                       event.fire("404")
                    }else{
                        view(res, data, event, {
                            url: views_key,
                            statusCode: 200,
                            data: data,
                            contentType:contentType
                        });
                    }
                })
            })
            .bind(404, function(){
                var object = status[404];
                object.code = 404;
                console.log("40404")
                view(res, data, event, {
                    url: $.path("app","views", "error.html" ),
                    statusCode: 404,
                    data: object,
                    contentType:contentType
                });
            })
        }
    }).listen($.configs.port);
   
})