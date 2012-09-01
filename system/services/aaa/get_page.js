define( function(){
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
