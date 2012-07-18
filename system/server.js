$.define("server","~flow,~ejs,~status,fs,url, querystring, http,app/configs", function(flow, ejs, status, fs, url, qs, http){
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
        console.log(location)
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

            event
            .bind(pages_key,function(data){
                res.writeHead(200, {
                    "Content-Type":  contentType
                });//注意这里
                res.write(data);
                res.end();
            } )
            .bind(views_key,function(){
                fs.readFile( views_key, 'utf-8', function (err, view_text ) {//读取内容
                    var data = {
                        title: function( t ){
                            data.title = t
                        },
                        layout: function( t ){
                            data.layout = t
                        }
                    };
                    if (err){
                        var text = fs.readFileSync( $.path("app","views", "error.html" ),  'utf-8');
                        data.partial =  $.ejs( text ).call(data, $.mix(
                            status[404],{
                                code: 404
                            }));
                        var layout_url = $.path("app","views/layout", data.layout )
                        var page_text = fs.readFileSync( layout_url,  'utf-8');
                        var page = $.viewsCache[ layout_url ] || $.ejs(page_text);
                        var html =  page( data );
                        $.log("<code style='color:red'>",html,"</code>",true);
                        res.writeHead(200, {
                            "Content-Type":  contentType
                        });//注意这里
                        res.write(html);
                        res.end();
                    }else{
                        var partial = $.viewsCache[ views_key ] || $.ejs( view_text );
                        data.partial = partial.call(data)
                        console.log(data)
                        var layout_url = $.path("app","views/layout", data.layout )
                        var page_text = fs.readFileSync( layout_url,  'utf-8');
                        var page = $.viewsCache[ layout_url ] || $.ejs(page_text);
                        var html =  page( data );
                        //     $.pagesCache[ cache_key ] = html;
                        //    fs.writeFile(opts.pages_key,html,"utf-8");
                        $.log("<code style='color:green'>",html,"</code>",true)
                        res.writeHead(200, {
                            "Content-Type":  contentType
                        });//注意这里
                        res.write(html);
                        res.end();
                    }
                })
            })
        }
    }).listen($.configs.port);
   
})