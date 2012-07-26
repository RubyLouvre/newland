$.define("get_page", function(){
    //本拦截器是用于取得拼装好的页面
    //http://d.hatena.ne.jp/scalar/20120508/1336488868
    return function( flow ){
        flow.bind("get_page", function(  ){
            var url = this.req.url;
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
                var page_url = $.path.join("app","pages", url );
                console.log(page_url)
                $.readFile( page_url, 'utf-8', function (err, html) {//读取内容
                    console.log(err)
                    if (err){
                        //如果不存在就从view目录中寻找相应模板来拼装
                        var view_url = $.path.join("app","views", url );
                        this.fire("get_view", view_url, url )
                    }else{
                        var cache = {
                            code: 200,
                            data: html,
                            type: this.content_type("html")
                        }
                        $.pagesCache[ url ] = cache;
                        this.fire("send_file", cache)
                    }
                }.bind(this));
            }
        });


    }


})