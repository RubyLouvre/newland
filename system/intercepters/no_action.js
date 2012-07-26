$.define("no_action", function(){
    return function(flow){
        flow.bind("no_action", function( ){
            $.log("已进入no_action栏截器")
            //去掉#？等杂质，如果是符合如下后缀后，则进行静态资源缓存
            var url = this.req.url;
            if( /\.(css|js|png|jpg|gif|ico)$/.test( url.replace(/[?#].*/, '') ) ){
                url = url.replace(/[?#].*/, '');
                var cache = $.staticCache[ url ],lm
                if( cache ){
                    if(( lm = cache.headers && cache.headers["Last-Modified"] )){
                        if( lm === this.header("if-modified-since")) {
                            this.res.writeHead(304, "Not Modified");
                            this.res.end();
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
                                type: this.content_type(),
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
                this.fire("get_page");
            }
        })
    }
})
