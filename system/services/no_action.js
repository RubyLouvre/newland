define(  function(){
    return function(flow){
        flow.bind("no_action", function( ){
            // $.log("已调用no_action服务")
            var url = flow.pathname
            if( flow.mime !== "*" ){ //其实这里应该让用户指定特定pathname开头为静态文件的目录名
                var cache = $.staticCache[ url ],lm
                if( cache ){
                    if(( lm = cache.headers && cache.headers["Last-Modified"] )){
                        if( lm === this.get("if-modified-since")) {
                            this.res.writeHead(304, "Not Modified");
                            this.res.end();
                            return;
                        }
                    }
                    this.fire("send_file", cache);
                }else{
                    //从硬盘中读取对应路径下的文件
                    var file = $.path.join("app/public/", url);
                    $.readFile(file, function(err, data){
                        var code = 200
                        if(err){
                            if(/\.css$/.test(file)){
                                var lessfile = file.replace(/\.css$/,".less");
                                return this.fire("get_less",lessfile)
                            }
                            code = 404
                            data = "";
                        }
                        //node.js向前端发送Last-Modified头部时，不要使用 new Date+""，
                        //而要用new Date().toGMTString()，因为前者可能出现中文乱码
                        //chrome 一定要发送Content-Type 请求头,要不样式表没有效果
                        cache = {
                            code: code,
                            data: data,
                            type: this.contentType( flow.mime ),
                            headers: {
                                "Last-Modified":new Date().toGMTString()
                            }
                        }
                        $.staticCache[ url ] = cache;
                        this.fire("send_file", cache)
                    }.bind(this));
                }
            }else{
                this.fire("get_page");
            }
        })
    }
})
