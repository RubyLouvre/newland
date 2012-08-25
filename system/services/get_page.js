$.define("get_page", function(){
    //本拦截器是用于取得拼装好的页面
    //http://d.hatena.ne.jp/scalar/20120508/1336488868
    return function( flow ){
        flow.bind("get_page", function( ){
            var url = this.pathname;
            $.log( "已进入get_page栏截器" );
            //如果是一个目录则默认加上index.html
            var index = $.path.join(url, "index.html")
           console.log("index : "  +index)
            var cache = $.pagesCache[ index ];
            if( cache ){
                this.fire("send_file", cache);
            }else{
                var page_url = $.path.join("app","pages", index );
                console.log("page_url : "+page_url)
                if(!$.config.get_in_pages){
                    page_url = page_url.replace("pages","XXX")
                }
                $.readFile( page_url, 'utf-8', function (err, html) {//读取内容
                    if (err){
                        //如果不存在就从view目录中寻找相应模板来拼装
                       
                        var view_url = $.path.join("app","views", index );
                         console.log("view_url : " + view_url)
                        this.fire("get_view", view_url, url )
                    }else{
                        var cache = {
                            code: 200,
                            data: html,
                            type: this.contentType("html")
                        }
                        $.pagesCache[ url ] = cache;
                        this.fire("send_file", cache)
                    }
                }.bind(this));
            }
        });


    }


});
/**
Last-Modified 与If-Modified-Since 都是用于记录页面最后修改时间的 HTTP 头信息，
只是 Last-Modified 是由服务器往客户端发送的 HTTP 头，而 If-Modified-Since
则是由客户端往服务器发送的头，可 以看到，再次请求本地存在的 cache 页面时，
客户端会通过 If-Modified-Since 头将先前服务器端发过来的 Last-Modified 最后修改时间戳发送回去，
这是为了让服务器端进行验证，通过这个时间戳判断客户端的页面是否是最新的，如果不是最新的，
则返回新的内容，如果是最新的，则 返回 304 告诉客户端其本地 cache 的页面是最新的，
于是客户端就可以直接从本地加载页面了，这样在网络上传输的数据就会大大减少，同时也减轻了服务器的负担。
前后端不一样。
很少有听说后端同学为了使用某个组件，比如rbac权限控制，而刻意改变自己的模型或模型的关系吧？
但是前端同学为了使用现成的某个组件，会经常调整自己的数据对象的格式，，来满足组件的要求。
这是因为前端的复杂度在适应多浏览器的兼容组件的编写上，所以弱化数据，，让数据模型去适应控制器。
后端一般都是控制器（角色）去适应模型（实体），而不是改变自己的模型，去适应自己的控制器吧。
* */