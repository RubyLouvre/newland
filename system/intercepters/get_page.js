$.define("get_page", function(){
    //本拦截器是用于取得拼装好的页面
    //http://d.hatena.ne.jp/scalar/20120508/1336488868
    return function( flow ){
        flow.bind("get_page", function( ){
            var url = this.req.url;
            var last_char = url[ url.length - 1 ];
             $.log( "已进入 get_page 栏截器" );
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
                $.readFile( page_url, 'utf-8', function (err, html) {//读取内容
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


});
/**
*
前后端不一样。

很少有听说后端同学为了使用某个组件，比如rbac权限控制，而刻意改变自己的模型或模型的关系吧？

但是前端同学为了使用现成的某个组件，会经常调整自己的数据对象的格式，，来满足组件的要求。

这是因为前端的复杂度在适应多浏览器的兼容组件的编写上，所以弱化数据，，让数据模型去适应控制器。

后端一般都是控制器（角色）去适应模型（实体），而不是改变自己的模型，去适应自己的控制器吧。
* */